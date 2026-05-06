export const CANVAS_WIDTH = 400
export const CANVAS_HEIGHT = 400
export const CELL_SIZE = 20
export const GRID_SIZE = CANVAS_WIDTH / CELL_SIZE

export const DIRECTIONS = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 },
}

export const INITIAL_SPEED = 150
export const SPEED_INCREMENT = 10
export const FOODS_PER_LEVEL = 5

export const COLORS = {
  background: '#1a1a2e',
  grid: '#16213e',
  snakeHead: '#0f0',
  snakeBody: '#0a0',
  food: '#f00',
}
