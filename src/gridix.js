// https://github.com/dmail-front/autotile

/*

partons sur un truc méga simple niveau map genre du niveau de
Mystic quest legend (https://www.youtube.com/watch?v=Qlzd_fzUCdA)
qui au final se jouait tres bien malgré un system de carte et déplacement
simplissime

- context api: https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D
https://github.com/ovalia/ovalia/blob/master/html/game.html
https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/isPointInPath

*/

import { createWorld, detectUnitCollision } from "src/world/world.js"
import { CELL_SIZE } from "src/game.constant.js"
import { createRectangle, cellToRectangleGeometry } from "src/unit/unit.rectangle.js"
import { createCircle, cellToCircleGeometry } from "src/unit/unit.circle.js"

window.splashscreen.remove()

const createFloorAtCell = ({ row, column }) => {
  return createRectangle({
    ...cellToRectangleGeometry({ row, column }),
    isSolid: false,
    fillStyle: "white",
  })
}

const createWallAtCell = ({ row, column }) => {
  return createRectangle({
    ...cellToRectangleGeometry({ row, column }),
    isSolid: true,
    fillStyle: "grey",
  })
}

const createHeroAtCell = ({ row, column, radius = 12 }) => {
  const hero = createCircle({
    ...cellToCircleGeometry({ row, column, radius }),
    isSolid: true,
    fillStyle: "red",
  })
  return hero
}

const units = [
  createFloorAtCell({ row: 0, column: 0 }),
  createWallAtCell({ row: 1, column: 0 }),
  createWallAtCell({ row: 2, column: 0 }),
  createFloorAtCell({ row: 0, column: 1 }),
  createWallAtCell({ row: 1, column: 1 }),
  createFloorAtCell({ row: 2, column: 1 }),
  createFloorAtCell({ row: 0, column: 2 }),
  createFloorAtCell({ row: 1, column: 2 }),
  createFloorAtCell({ row: 2, column: 2 }),
]

const hero = createHeroAtCell({ row: 0, column: 0 })
units.push(hero)

const moveAvailables = [
  // directions
  "left",
  "right",
  "top",
  "bottom",
]
moveAvailables.forEach((direction) => {
  const heroCellToMoveCell = (heroCell) => {
    if (direction === "left") {
      if (heroCell.x === 0) {
        return null
      }
      return {
        x: heroCell.x - CELL_SIZE,
        y: heroCell.y,
      }
    }
    if (direction === "right") {
      if (heroCell.x === 2 * CELL_SIZE) {
        return null
      }
      return {
        x: heroCell.x + CELL_SIZE,
        y: heroCell.y,
      }
    }
    if (direction === "top") {
      if (heroCell.y === 0) {
        return null
      }
      return {
        x: heroCell.x,
        y: heroCell.y - CELL_SIZE,
      }
    }
    if (heroCell.y === 2 * CELL_SIZE) {
      return null
    }
    return {
      x: heroCell.x,
      y: heroCell.y + CELL_SIZE,
    }
  }

  const moveAvailableHint = createRectangle({
    isSolid: false,
    x: 0,
    y: 0,
    z: 10,
    width: CELL_SIZE,
    height: CELL_SIZE,
    fillStyle: "transparent",
    opacity: 0.5,
    tick: () => {
      const heroCell = cellFromPoint(hero)
      const moveAvailableCell = heroCellToMoveCell(heroCell)
      if (moveAvailableCell) {
        const destinationPoint = cellToCellCenter(moveAvailableCell)
        const moveAllowed = testMoveTo(hero, destinationPoint)
        if (moveAllowed) {
          moveAvailableHint.move(moveAvailableCell)
          return {
            fillStyle: "green",
          }
        }
      }

      return {
        fillStyle: "transparent",
      }
    },
  })
  units.push(moveAvailableHint)
})

const cellToCellCenter = ({ x, y }) => {
  return {
    x: x + CELL_SIZE / 2,
    y: y + CELL_SIZE / 2,
  }
}

const testMoveTo = (unit, destinationPoint) => {
  const currentPosition = { x: unit.x, y: unit.y }
  unit.move(destinationPoint)
  const collision = Boolean(detectUnitCollision(unit, units, world))
  unit.move(currentPosition)
  return !collision
}

const cellFromPoint = ({ x, y }) => {
  return {
    x: Math.floor(x / CELL_SIZE) * CELL_SIZE,
    y: Math.floor(y / CELL_SIZE) * CELL_SIZE,
  }
}

const world = createWorld({
  width: 3 * CELL_SIZE,
  height: 3 * CELL_SIZE,
  units,
})
document.body.appendChild(world.canvas)

world.start()

world.canvas.addEventListener("click", (clickEvent) => {
  const clickPoint = {
    x: clickEvent.offsetX,
    y: clickEvent.offsetY,
  }
  const destinationPoint = cellToCellCenter(cellFromPoint(clickPoint))
  const moveAllowed = testMoveTo(hero, destinationPoint)
  if (moveAllowed) {
    hero.move(destinationPoint)
  }
})
