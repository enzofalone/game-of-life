const canvas = document.querySelector('#game') as HTMLCanvasElement;
const ctx = canvas.getContext('2d');

const SCREEN = {
  WIDTH: 1024,
  HEIGHT: 1024,
};

const TILE_SIZE = 16;
const TILE_OFFSET = 2; // gap between each tile

const TOTAL_ROWS = Math.floor(SCREEN.HEIGHT / TILE_SIZE);
const TOTAL_COLUMNS = Math.floor(SCREEN.WIDTH / TILE_SIZE);

// store coordinates onmousemove
let mouseX = -1;
let mouseY = -1;

let map = initializeMap();

// general game vars
let running = false;
let generation = 0;
let population = 0;

// button and inputs
const resetButton = document.querySelector("#button-reset") as HTMLButtonElement;
const startButton = document.querySelector('#button-start') as HTMLButtonElement;
const stepButton = document.querySelector('#button-step') as HTMLButtonElement;

/**
 * get position in relation to canvas
 */
function getMousePos(canvas: HTMLCanvasElement, event: MouseEvent) {
  var rect = canvas.getBoundingClientRect();
  return {
    x: ((event.clientX - rect.left) / (rect.right - rect.left)) * canvas.width,
    y: ((event.clientY - rect.top) / (rect.bottom - rect.top)) * canvas.height,
  };
}

function updateMousePos(event: MouseEvent) {
  const { x, y } = getMousePos(canvas, event);

  mouseX = x;
  mouseY = y;
}

function initializeMap(): boolean[][] {
  let arr = [];

  for (let i = 0; i < Math.floor(SCREEN.HEIGHT / TILE_SIZE); i++) {
    arr[i] = new Array(Math.floor(SCREEN.WIDTH / TILE_SIZE)).fill(false);
  }

  return arr;
}

function isCellHovered(col: number, row: number): boolean {
  if (
    mouseX > row * (TILE_SIZE + TILE_OFFSET) &&
    mouseX < row * (TILE_SIZE + TILE_OFFSET) + TILE_SIZE &&
    mouseY > col * (TILE_SIZE + TILE_OFFSET) &&
    mouseY < col * (TILE_SIZE + TILE_OFFSET) + TILE_SIZE
  ) {
    return true;
  }
  return false;
}

function countNeighbours(oldMap: boolean[][],col: number, row: number): number {
  let neighbours = 0;
  // right and diagonals
  if (col < TOTAL_COLUMNS) {
    if (oldMap[row][col + 1]) {
      neighbours++;
    }

    if (row < TOTAL_ROWS -1) {
      if (oldMap[row + 1][col + 1]) {
        neighbours++;
      }
    }
    if (row > 0) {
      if (oldMap[row - 1][col + 1]) {
        neighbours++;
      }
    }
  }

  // left and diagonals
  if (col > 0) {
    if (oldMap[row][col - 1]) {
      neighbours++;
    }

    if (row < TOTAL_ROWS - 1) {
      if (oldMap[row + 1][col - 1]) {
        neighbours++;
      }
    }

    if (row > 0) {
      if (oldMap[row - 1][col - 1]) {
        neighbours++;
      }
    }
  }

  // down
  if (row < TOTAL_ROWS - 1) {
    if (oldMap[row + 1][col]) {
      neighbours++;
    }
  }

  if (row > 0) {
    if (oldMap[row - 1][col]) {
      neighbours++;
    }
  }

  return neighbours;
}

// called at interval
function update(){
  if (!running) {
    return;
  }
  tick();
}

// update function
function tick() {
  const oldMap = JSON.parse(JSON.stringify(map));
 // check lifecycle of every cell
  for (let row = 0; row < oldMap.length; row++) {
    for (let col = 0; col < oldMap[row].length; col++) {
      const neighbours = countNeighbours(oldMap, col, row);

      if ((neighbours < 2 || neighbours > 3) && oldMap[row][col]) { // dead by under/overpopulation
        map[row][col] = false;
        population--;
      } else if ((neighbours === 2 || neighbours === 3) && oldMap[row][col] === true) { // live to the next generation
        map[row][col] = true;
      } else if (neighbours === 3 && oldMap[row][col] === false) { // reproduction
        map[row][col] = true;
        population++;
      }
    }
  }
  generation++;
}

function draw() {
  if (!ctx) {
    return console.error('No context found');
  }
  // clear screen for next iteration
  ctx.clearRect(0, 0, SCREEN.WIDTH, SCREEN.HEIGHT);

  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, SCREEN.WIDTH, SCREEN.HEIGHT);

  // draw tiles
  for (let row = 0; row < map.length; row++) {
    for (let col = 0; col < map[row].length; col++) {
      if (map[row][col] === false) {
        if (isCellHovered(col, row)) {
          ctx.fillStyle = '#a9a9a9';
        } else {
          ctx.fillStyle = '#000000';
        }
      } else {
        ctx.fillStyle = '#ffffff';
      }

      ctx.fillRect(
        row * (TILE_SIZE + TILE_OFFSET),
        col * (TILE_SIZE + TILE_OFFSET),
        TILE_SIZE,
        TILE_SIZE
      );
    }
  }

  // draw some info
  ctx.fillStyle = '#ffffff';
  ctx.font = '32px serif';
  ctx.fillText(`Population: ${population}`, 10, 50);
  ctx.fillText(`Generation: ${generation}`, 10, 100);
}

function onScreenClick() {
  for (let row = 0; row < map.length; row++) {
    for (let col = 0; col < map[row].length; col++) {
      if (isCellHovered(col, row)) {
        map[row][col] = !map[row][col];
        population += map[row][col] ? 1 : -1; // once the game runs it wont work as it wont be updated in the future yet
      }
    }
  }
}

function resetGame() {
  map = initializeMap();
  population = 0;
  generation = 0;
  running = false;
}

function startOrPauseGame(){
    running = !running;
}

function onKeyDown(event: KeyboardEvent) {
  if (event.key === ' ') {
    startOrPauseGame();
  }
}

function main() {
  window.addEventListener('mousemove', updateMousePos, false);
  window.addEventListener('keydown', onKeyDown, false);
  
  resetButton.addEventListener('click', resetGame);
  startButton.addEventListener('click', startOrPauseGame);
  stepButton.addEventListener('click', tick);

  canvas.addEventListener('click', onScreenClick, false);

  window.setInterval(update, 300);
  window.setInterval(draw,16.67);
}

window.addEventListener('load', () => {
  main();
})