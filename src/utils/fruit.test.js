import { describe, test, expect } from 'vitest'
import { FRUIT_TYPES, CORNER_SIZE, GRID_SIZE } from './constants'

describe('FRUIT_TYPES', () => {
  test('has at least 3 fruit types', () => {
    expect(FRUIT_TYPES.length).toBeGreaterThanOrEqual(3)
  })

  test('each fruit has required properties', () => {
    FRUIT_TYPES.forEach((fruit) => {
      expect(fruit).toHaveProperty('id')
      expect(fruit).toHaveProperty('name')
      expect(fruit).toHaveProperty('color')
      expect(fruit).toHaveProperty('points')
      expect(fruit).toHaveProperty('speedMod')
      expect(fruit).toHaveProperty('weight')
      expect(typeof fruit.points).toBe('number')
      expect(typeof fruit.speedMod).toBe('number')
      expect(typeof fruit.weight).toBe('number')
    })
  })

  test('each fruit has a unique id', () => {
    const ids = FRUIT_TYPES.map((f) => f.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  test('each fruit has positive points', () => {
    FRUIT_TYPES.forEach((fruit) => {
      expect(fruit.points).toBeGreaterThan(0)
    })
  })

  test('each fruit has positive weight', () => {
    FRUIT_TYPES.forEach((fruit) => {
      expect(fruit.weight).toBeGreaterThan(0)
    })
  })

  test('weights sum to a reasonable number', () => {
    const total = FRUIT_TYPES.reduce((sum, f) => sum + f.weight, 0)
    expect(total).toBeGreaterThan(0)
  })
})

describe('Corner avoidance', () => {
  test('CORNER_SIZE is positive', () => {
    expect(CORNER_SIZE).toBeGreaterThan(0)
  })

  test('corner positions are correctly identified', () => {
    const g = GRID_SIZE - 1
    const corners = [
      [0, 0], [1, 0], [0, 1], [1, 1],
      [g, 0], [g - 1, 0], [g, 1], [g - 1, 1],
      [0, g], [1, g], [0, g - 1], [1, g - 1],
      [g, g], [g - 1, g], [g, g - 1], [g - 1, g - 1],
    ]
    corners.forEach(([x, y]) => {
      const inCorner = (
        (x < CORNER_SIZE && y < CORNER_SIZE) ||
        (x > g - CORNER_SIZE && y < CORNER_SIZE) ||
        (x < CORNER_SIZE && y > g - CORNER_SIZE) ||
        (x > g - CORNER_SIZE && y > g - CORNER_SIZE)
      )
      expect(inCorner).toBe(true)
    })
  })

  test('center positions are not corners', () => {
    const g = GRID_SIZE - 1
    const centers = [
      [10, 10], [5, 5], [0, 5], [5, 0],
      [g, 5], [5, g], [CORNER_SIZE, CORNER_SIZE],
    ]
    centers.forEach(([x, y]) => {
      const inCorner = (
        (x < CORNER_SIZE && y < CORNER_SIZE) ||
        (x > g - CORNER_SIZE && y < CORNER_SIZE) ||
        (x < CORNER_SIZE && y > g - CORNER_SIZE) ||
        (x > g - CORNER_SIZE && y > g - CORNER_SIZE)
      )
      expect(inCorner).toBe(false)
    })
  })

  test('no corner positions are at exact corners', () => {
    const g = GRID_SIZE - 1
    const exactCorners = [[0, 0], [g, 0], [0, g], [g, g]]
    exactCorners.forEach(([x, y]) => {
      const inCorner = (
        (x < CORNER_SIZE && y < CORNER_SIZE) ||
        (x > g - CORNER_SIZE && y < CORNER_SIZE) ||
        (x < CORNER_SIZE && y > g - CORNER_SIZE) ||
        (x > g - CORNER_SIZE && y > g - CORNER_SIZE)
      )
      expect(inCorner).toBe(true)
    })
  })
})

describe('Fruit speed modifiers', () => {
  test('at least one fruit speeds up the game (negative speedMod)', () => {
    const hasSpeedUp = FRUIT_TYPES.some((f) => f.speedMod < 0)
    expect(hasSpeedUp).toBe(true)
  })

  test('at least one fruit slows down the game (positive speedMod)', () => {
    const hasSlowDown = FRUIT_TYPES.some((f) => f.speedMod > 0)
    expect(hasSlowDown).toBe(true)
  })

  test('at least one fruit has no speed effect (speedMod === 0)', () => {
    const hasNeutral = FRUIT_TYPES.some((f) => f.speedMod === 0)
    expect(hasNeutral).toBe(true)
  })
})
