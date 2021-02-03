import { createWorld } from "src/game/world.js"
import { closestCellIndexFromPoint, generateCells } from "src/geometry/grid.js"
import { createWorldBounds } from "./world-bound.js"
import { createKeyboardNavigation } from "./keyboard-navigation.js"
import { createWall } from "./wall.js"
import { createSideWalk } from "./sidewalk.js"
import { createIce } from "./ice.js"
import { createHero } from "./hero.js"

export const demoBloc = () => {
  const worldGrid = {
    cellXCount: 10,
    cellYCount: 10,
    cellSize: 32,
    cells: [],
  }
  worldGrid.cells = generateCells(worldGrid)
  window.worldGrid = worldGrid

  const world = createWorld({
    worldWidth: worldGrid.cellXCount * worldGrid.cellSize,
    worldHeight: worldGrid.cellYCount * worldGrid.cellSize,
    onGameObjectAdded: (gameObject) => {
      if (typeof gameObject.centerX === "number") {
        assignGameObjectCellOnAdded(gameObject, worldGrid)
      }
    },
    onGameObjectMoved: (gameObject, move) => {
      if (move.from && gameObject.onMove) {
        gameObject.onMove(move)
      }
      updateGameObjectCellOnMoved(gameObject, move, worldGrid)
    },
  })

  const addWall = ({ cellX, cellY }) => {
    const wall = createWall({
      cellX,
      cellY,
      worldGrid,
    })
    world.addGameObject(wall)
  }

  const addBaril = ({ cellX, cellY }) => {
    const baril = createWall({
      cellX,
      cellY,
      worldGrid,
    })
    world.addGameObject(baril)
  }

  const addIce = ({ cellX, cellY }) => {
    const ice = createIce({
      cellX,
      cellY,
      worldGrid,
    })
    world.addGameObject(ice)
  }

  const addSideWalkTop = ({ cellX, cellY }) => {
    const sidewalk = createSideWalk({
      cellX,
      cellY,
      worldGrid,
      force: -6000,
    })
    world.addGameObject(sidewalk)
  }

  const addHero = ({ cellX, cellY }) => {
    const hero = createHero({ cellX, cellY, worldGrid })
    world.addGameObject(hero)
    return hero
  }

  const worldBounds = createWorldBounds({
    worldWidth: world.worldWidth,
    worldHeight: world.wolrdHeight,
  })
  Object.keys(worldBounds).forEach((key) => {
    world.addGameObject(worldBounds[key])
  })

  const keyboardNav = createKeyboardNavigation({
    world,
  })
  // put keyboard first so that sidewalk will be able to add/substract force from keyboard impulse
  world.addGameObject(keyboardNav)

  addSideWalkTop({ cellX: 5, cellY: 1 })
  addSideWalkTop({ cellX: 5, cellY: 2 })
  addSideWalkTop({ cellX: 5, cellY: 3 })

  addWall({ cellX: 1, cellY: 0 })
  addWall({ cellX: 1, cellY: 1 })
  addBaril({ cellX: 1, cellY: 2 })
  addBaril({ cellX: 2, cellY: 2 })
  addBaril({ cellX: 5, cellY: 3 })
  addWall({ cellX: 1, cellY: 3 })

  // addIce({ cellX: 0, cellY: 0 })
  addIce({ cellX: 3, cellY: 7 })
  addIce({ cellX: 4, cellY: 7 })
  addIce({ cellX: 5, cellY: 7 })
  addIce({ cellX: 3, cellY: 8 })
  addIce({ cellX: 4, cellY: 8 })
  addIce({ cellX: 5, cellY: 8 })
  addIce({ cellX: 6, cellY: 7 })
  addIce({ cellX: 6, cellY: 8 })

  world.hero = addHero({ cellX: 0, cellY: 0 })

  return world
}

const assignGameObjectCellOnAdded = (gameObject, worldGrid) => {
  const cellIndex = closestCellIndexFromPoint(
    { x: gameObject.centerX, y: gameObject.centerY },
    worldGrid,
  )
  gameObject.cellIndex = cellIndex

  if (cellIndex === -1) {
    return
  }

  const cellMates = worldGrid.cells[cellIndex] || []
  addItemToCell(worldGrid, cellIndex, gameObject)
  cellMates.forEach((cellMate) => {
    if (cellMate.onCellMateJoin) {
      cellMate.onCellMateJoin(gameObject)
    }
  })
}

const updateGameObjectCellOnMoved = (gameObject, move, worldGrid) => {
  const cellIndexPrevious = gameObject.cellIndex
  const cellIndex = closestCellIndexFromPoint(move.to, worldGrid)
  if (cellIndexPrevious === cellIndex) {
    return
  }

  gameObject.cellIndex = cellIndex

  if (cellIndexPrevious !== -1) {
    const cellMatesPrevious = removeItemFromCell(worldGrid, cellIndexPrevious, gameObject)
    cellMatesPrevious.forEach((cellMatePrevious) => {
      if (cellMatePrevious.onCellMateLeave) {
        cellMatePrevious.onCellMateLeave(gameObject)
      }
    })
  }

  if (cellIndex === -1) {
    return
  }

  const cellMates = worldGrid.cells[cellIndex] || []
  addItemToCell(worldGrid, cellIndex, gameObject)
  cellMates.forEach((cellMate) => {
    if (cellMate.onCellMateJoin) {
      cellMate.onCellMateJoin(gameObject)
    }
  })
}

const removeItemFromCell = (grid, cellIndex, itemToRemove) => {
  const cells = grid.cells
  const cell = cells[cellIndex]

  if (!cell) {
    const cellWithoutItem = []
    cells[cellIndex] = cellWithoutItem
    return cellWithoutItem
  }

  let i = cell.length
  const cellWithoutItem = []
  while (i--) {
    const itemCandidate = cell[i]
    if (itemCandidate !== itemToRemove) {
      cellWithoutItem.push(itemCandidate)
    }
  }
  cells[cellIndex] = cellWithoutItem

  return cellWithoutItem
}

const addItemToCell = (grid, cellIndex, item) => {
  const cells = grid.cells
  const cell = cells[cellIndex]
  if (cell) {
    const cellWithItem = [...cell, item]
    cells[cellIndex] = cellWithItem
    return cellWithItem
  }

  const cellWithItem = [item]
  cells[cellIndex] = cellWithItem
  return cellWithItem
}
