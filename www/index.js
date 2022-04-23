import { Universe } from "wasm-game-of-life";

const CELL_SIZE = 5; // px
const GRID_COLOR = "#CCCCCC";
const DEAD_COLOR = "#FFFFFF";
const ALIVE_COLOR = "#000000";

const width = 64;
const height = 64;

let universe = Universe.new(width, height);

// Give the canvas room for all of our cells and a 1px border
// around each of them.
const canvas = document.getElementById("game-of-life-canvas");
canvas.height = (CELL_SIZE + 1) * height + 1;
canvas.width = (CELL_SIZE + 1) * width + 1;

const ctx = canvas.getContext('2d');

const drawGrid = () => {
    ctx.beginPath();
    ctx.strokeStyle = GRID_COLOR;

    // Vertical lines.
    for (let i = 0; i <= width; i++) {
        ctx.moveTo(i * (CELL_SIZE + 1) + 1, 0);
        ctx.lineTo(i * (CELL_SIZE + 1) + 1, (CELL_SIZE + 1) * height + 1);
    }

    // Horizontal lines.
    for (let j = 0; j <= height; j++) {
        ctx.moveTo(0,                           j * (CELL_SIZE + 1) + 1);
        ctx.lineTo((CELL_SIZE + 1) * width + 1, j * (CELL_SIZE + 1) + 1);
    }

    ctx.stroke();
};

const drawCells = () => {
    ctx.beginPath();

    for (let row = 0; row < height; row++) {
        for (let col = 0; col < width; col++) {
            ctx.fillStyle = universe.is_alive(row, col) ? ALIVE_COLOR : DEAD_COLOR;
            ctx.fillRect(
                col * (CELL_SIZE + 1) + 1,
                row * (CELL_SIZE + 1) + 1,
                CELL_SIZE,
                CELL_SIZE
            );
        }
    }

    ctx.stroke();
};

function sleep(milliseconds) {
    const date = Date.now();
    let currentDate = null;
    do {
        currentDate = Date.now();
    } while (currentDate - date < milliseconds);
}

let animationId = null;

const playPauseButton = document.getElementById("play-pause");
const playOneStepButton = document.getElementById("play-one-step");
const clearButton = document.getElementById("clear");
const resetRandomButton = document.getElementById("reset-random");

const play = () => {
    playPauseButton.textContent = "⏸";
    playOneStepButton.disabled = true;
    renderLoop();
};

const pause = () => {
    playPauseButton.textContent = "⏭";
    playOneStepButton.disabled = false;
    cancelAnimationFrame(animationId); // TODO not sure what this does
    animationId = null;
};

const isPaused = () => {
    return animationId === null;
};

playPauseButton.addEventListener("click", event => {
    if (isPaused()) {
        play();
    } else {
        pause();
    }
});

playOneStepButton.addEventListener("click", event => {
    universe.tick();
    drawGrid();
    drawCells();
})

clearButton.addEventListener("click", event => {
    for (let row = 0; row < height; row++) {
        for (let col = 0; col < width; col++) {
            universe.set_cell(row, col, false);
        }
    }

    drawGrid();
    drawCells();
})

resetRandomButton.addEventListener("click", event => {
    universe = Universe.new(width, height);
    drawGrid();
    drawCells();
})

const safeSetCell = (row, col, state) => {
    if ((row > height - 1) ||
        (col > width - 1) ||
        (row < 0) || (col < 0)
    ) {
        return;
    }

    universe.set_cell(row, col, state);
}

canvas.addEventListener("click", event => {
    const boundingRect = canvas.getBoundingClientRect();

    const scaleX = canvas.width / boundingRect.width;
    const scaleY = canvas.height / boundingRect.height;

    const canvasLeft = (event.clientX - boundingRect.left) * scaleX;
    const canvasTop = (event.clientY - boundingRect.top) * scaleY;

    const row = Math.min(Math.floor(canvasTop / (CELL_SIZE + 1)), height - 1);
    const col = Math.min(Math.floor(canvasLeft / (CELL_SIZE + 1)), width - 1);

    if (event.ctrlKey) {
        if (event.shiftKey) {
            /***
             * Pulsar
             * Center (row/col coords) marked by 'C' (and is a dead cell):
             *
             * ...............
             * ...XXX...XXX...
             * ..X...X.X...X..
             * ..X...X.X...X..
             * ..X...X.X...X..
             * ...XXX...XXX...
             * .......C.......
             * ...XXX...XXX...
             * ..X...X.X...X..
             * ..X...X.X...X..
             * ..X...X.X...X..
             * ...XXX...XXX...
             * ...............
             *
             * A single quadrant: (C is dead)
             * .XXX.    horiz_line offset=-2
             * X...X
             * X.C.X
             * X...X
             * .XXX.    horiz_line offset=+2
             */

            const horizLine = (offset, r, c) => {
                return [
                    [r+offset, c-1, true],
                    [r+offset, c, true],
                    [r+offset, c+1, true],
                ];
            }

            const vertLine = (offset, r, c) => {
                return [
                    [r-1, c+offset, true],
                    [r, c+offset, true],
                    [r+1, c+offset, true],
                ]
            }

            const quadrent = (r, c) => {
                horizLine(-2, r, c)
                    .concat(horizLine(+2, r, c))
                    .concat(vertLine(-2, r, c))
                    .concat(vertLine(+2, r, c))
                    .forEach((x, i) => {
                        safeSetCell(x[0], x[1], x[2]);
                    })
            }

            // clear area
            for (let r = row - 5; r < row + 5; r++) {
                for (let c = col - 5; c < col + 5; c++) {
                    safeSetCell(r, c, false)
                }
            }

            quadrent(row-3, col-3);
            quadrent(row-3, col+3);
            quadrent(row+3, col-3);
            quadrent(row+3, col+3);
        } else {
            /***
             * Glider
             *
             * 0  0  1
             * 1 [0] 1
             * 0  1  1
             */
            safeSetCell(row-1, col-1, false);
            safeSetCell(row-1, col, false);
            safeSetCell(row-1, col+1, true);
            safeSetCell(row, col-1, true);
            safeSetCell(row, col, false);
            safeSetCell(row, col+1, true);
            safeSetCell(row+1, col-1, false);
            safeSetCell(row+1, col, true);
            safeSetCell(row+1, col+1, true);
        }
    } else {
        universe.set_cell(row, col, !universe.is_alive(row, col));
    }

    drawGrid();
    drawCells();
})

const renderLoop = () => {
    universe.tick();

    drawGrid();
    drawCells();

    animationId = requestAnimationFrame(renderLoop);
};

drawGrid();
drawCells();
pause();
