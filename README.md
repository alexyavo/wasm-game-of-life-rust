## About

Game of Life implementation in Rust, exposed via WASM and rendered with Javascript/Canvas 2D API.

Somewhat modified version of  https://rustwasm.github.io/docs/book/introduction.html:  
My implementation uses `Vec<u32>` to represent the cells, where each entry of the 
vector contains the states of `32` cells (every bit means alive/dead).

## Project Bootstrap

This project was generated from a template:
```
cargo generate --git https://github.com/rustwasm/wasm-pack-template.git --name my-project
```

the project under `www` was generated using:
```
npm init wasm-app www
```

## 🛠️ Building 
### WASM 
from project root: 

```
wasm-pack build
```

this generates the `pkg` dir with all the WASM stuff (the binary and JSON wrappers).

### `www`
from `www` dir:
```
npm install
npm start
```

and now go to `http://localhost:8080`


### 🔬 Test in Headless Browsers with `wasm-pack test`

```
wasm-pack test --headless --firefox
```

### 🎁 Publish to NPM with `wasm-pack publish`

```
wasm-pack publish
```

## Dependencies

* [`wasm-bindgen`](https://github.com/rustwasm/wasm-bindgen) for communicating
  between WebAssembly and JavaScript.

* [`console_error_panic_hook`](https://github.com/rustwasm/console_error_panic_hook)
  for logging panic messages to the developer console.

* [`wee_alloc`](https://github.com/rustwasm/wee_alloc), an allocator optimized
  for small code size.
