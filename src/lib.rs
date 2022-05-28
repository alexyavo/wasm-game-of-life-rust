mod utils;

use std::fmt;
use wasm_bindgen::prelude::*;
use js_sys::Math::random;
extern crate web_sys;
use web_sys::console;

// When the `wee_alloc` feature is enabled, use `wee_alloc` as the global allocator.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;


// A macro to provide `println!(..)`-style syntax for `console.log` logging.
macro_rules! log {
    ( $( $t:tt )* ) => {
      console::log_1(&format!( $( $t )* ).into());
    }
}

pub struct Timer<'a> {
  name: &'a str,
}

impl<'a> Timer<'a> {
  pub fn new(name: &'a str) -> Timer<'a> {
    console::time_with_label(name);
    Timer { name }
  }
}

impl<'a> Drop for Timer<'a> {
  fn drop(&mut self) {
    console::time_end_with_label(self.name);
  }
}

#[wasm_bindgen]
pub struct Universe {
  width: u32,
  height: u32,
  cells: Vec<u32>,  // each entry represents states of 32 cells
}

fn is_out_of_bounds(curr: u32, delta: i32, limit: u32) -> bool {
  let x = (curr as i32) + delta;
  x < 0 || x > ((limit - 1) as i32)
}

fn next_state(curr_cell_state: bool, live_neighbours: u32) -> bool {
  match (curr_cell_state, live_neighbours) {
    (true, x) if x < 2 => false,
    (true, 2) | (true, 3) => true,
    (true, x) if x > 3 => false,
    (false, 3) => true,
    (state, _) => state,
  }
}

fn set_cell_of(
  cells: &mut Vec<u32>,
  (cell_repr_entry_idx, cell_repr_idx): (usize, u32),
  alive: bool
) {
  if alive {
    cells[cell_repr_entry_idx] |= 1 << cell_repr_idx;
  } else {
    cells[cell_repr_entry_idx] &= !(1 << cell_repr_idx);
  }
}

// fn random() -> f64 {
//   let mut rng = rand::thread_rng();
//   rng.gen_range(0.0..1.0)
// }

#[wasm_bindgen]
impl Universe {
  fn get_index(&self, row: u32, column: u32) -> u32 {
    row * self.width + column
  }

  fn cell_coords(&self, row: u32, col: u32) -> (usize, u32) {
    let cell_idx = row * self.width + col; // map 2D coords to 1D
    let cell_repr_entry_idx = cell_idx / 32;
    let cell_repr_idx = cell_idx % 32;

    (cell_repr_entry_idx as usize, cell_repr_idx)
  }

  pub fn is_alive(&self, row: u32, col: u32) -> bool {
    let (cell_repr_entry_idx, cell_repr_idx) = self.cell_coords(row, col);
    (self.cells[cell_repr_entry_idx] & (1 << cell_repr_idx)) != 0
  }

  pub fn set_cell(&mut self, row: u32, col: u32, alive: bool) {
    let cell_coords = self.cell_coords(row, col);
    set_cell_of(&mut self.cells, cell_coords, alive);
  }

  fn live_neighbor_count(&self, row: u32, col: u32) -> u32 {
    let mut count = 0;

    for delta_row in [-1, 0, 1] {
      for delta_col in [-1, 0, 1] {
        let its_me = delta_row == 0 && delta_col == 0;
        if its_me
          || is_out_of_bounds(row, delta_row, self.height)
          || is_out_of_bounds(col, delta_col, self.width)
        {
          continue
        }

        let nrow = (row as i32 + delta_row) as u32;
        let ncol = (col as i32 + delta_col) as u32;
        count += self.is_alive(nrow, ncol) as u32;
      }
    }

    count
  }

  pub fn width(&self) -> u32 {
    self.width
  }

  pub fn height(&self) -> u32 {
    self.height
  }

  pub fn cells(&self) -> *const u32 {
    self.cells.as_ptr()
  }

  pub fn tick(&mut self) {
    let _timer = Timer::new("Universe::tick");

    let mut next_cells = {
      let _timer = Timer::new("allocate next cells");
      self.cells.clone()
    };

    {
      let _timer = Timer::new("new generation");
      for row in 0..self.height {
        for col in 0..self.width {
          let curr_cell_state = self.is_alive(row, col);
          let live_neighbors = self.live_neighbor_count(row, col);
          let next_cell_state = next_state(curr_cell_state, live_neighbors);

          if curr_cell_state != next_cell_state {
            // optimization, no need for redundant operations if state didn't change.
            // not sure how much it saves...
            set_cell_of(&mut next_cells, self.cell_coords(row, col), next_cell_state);
          }
        }
      }
    }

    let _timer = Timer::new("free old cells");
    self.cells = next_cells;
  }

  pub fn new(width: u32, height: u32) -> Universe {
    utils::set_panic_hook();

    let total_cells = width * height;
    let required_u32s = total_cells / 32 + ((total_cells % 32 != 0) as u32);

    let cells =
      (0..required_u32s)
        .map(|_| { (random() * (u32::MAX as f64)) as u32 })
        .collect();

    log!("initial state of cells: {:?}", cells);

    Universe {
      width,
      height,
      cells,
    }
  }
}
