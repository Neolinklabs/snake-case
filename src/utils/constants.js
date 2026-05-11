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

export const FRUIT_TYPES = [
  { id: 'apple', name: '苹果', color: '#ff3333', accentColor: '#4a2c0a', points: 10, speedMod: 0, weight: 30 },
  { id: 'banana', name: '香蕉', color: '#ffe135', accentColor: '#b8a000', points: 15, speedMod: -5, weight: 20 },
  { id: 'grape', name: '葡萄', color: '#8e44ad', accentColor: '#6c3483', points: 5, speedMod: 8, weight: 20 },
  { id: 'orange', name: '橙子', color: '#ff8c00', accentColor: '#e67e22', points: 10, speedMod: 0, weight: 15 },
  { id: 'watermelon', name: '西瓜', color: '#27ae60', accentColor: '#e74c3c', points: 20, speedMod: 8, weight: 5 },
  { id: 'cherry', name: '樱桃', color: '#c0392b', accentColor: '#8b0000', points: 8, speedMod: -3, weight: 10 },
]

export const CORNER_SIZE = 2
