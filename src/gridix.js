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

import { CELL_SIZE } from "src/game.constant.js"
import { unitCollidesWithUnit } from "src/unit/unit.js"
import { createRectangle, cellToRectangleGeometry } from "src/unit/unit.rectangle.js"
import { createCircle, cellToCircleGeometry } from "src/unit/unit.circle.js"

window.splashscreen.remove()

const createFloorAtCell = ({ row, column }) => {
  return createRectangle({
    ...cellToRectangleGeometry({ row, column }),
    solid: false,
    fillStyle: "white",
  })
}

const createWallAtCell = ({ row, column }) => {
  return createRectangle({
    ...cellToRectangleGeometry({ row, column }),
    solid: true,
    fillStyle: "grey",
  })
}

const createHeroAtCell = ({ row, column, radius = 12 }) => {
  const hero = createCircle({
    ...cellToCircleGeometry({ row, column, radius }),
    solid: true,
    fillStyle: "red",
  })
  return hero
}

const createGame = ({ rowCount = 3, columnCount = 3, units } = {}) => {
  const canvas = createCanvas({
    width: CELL_SIZE * columnCount,
    height: CELL_SIZE * rowCount,
  })
  const context = canvas.getContext("2d")

  const render = () => {
    units.forEach((unit) => {
      unit.tick()
    })
    context.clearRect(0, 0, canvas.width, canvas.height)
    units
      .sort((leftUnit, rightUnit) => leftUnit.z - rightUnit.z)
      .forEach((unit) => {
        unit.draw(context)
      })
  }

  // const addUnit = (unit) => {
  //   const index = getSortedIndexForValueInArray(unit, units)
  //   units.splice(index, 0, unit)

  //   return () => {
  //     const index = units.indexOf(unit)
  //     if (index > -1) {
  //       units.splice(index, 1)
  //     }
  //   }
  // }

  const startRendering = () => {
    render()

    let stopRendering = () => {}
    const next = () => {
      const animationFrame = requestAnimationFrame(() => {
        render()
        next()
      })
      stopRendering = () => {
        window.cancelAnimationFrame(animationFrame)
      }
    }

    next()

    return stopRendering
  }

  const unitsFromPoint = ({ x, y }) => {
    return units.filter((unit) => {
      return context.isPointInPath(unit.path, x, y)
    })
  }

  const cellFromPoint = ({ x, y }) => {
    return {
      x: Math.floor(x / CELL_SIZE) * CELL_SIZE,
      y: Math.floor(y / CELL_SIZE) * CELL_SIZE,
    }
  }

  return {
    canvas,
    render,
    startRendering,
    unitsFromPoint,
    cellFromPoint,
  }
}

const createCanvas = ({ width, height }) => {
  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height
  return canvas
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
    x: 0,
    y: 0,
    z: 10,
    width: CELL_SIZE,
    height: CELL_SIZE,
    fillStyle: "transparent",
    opacity: 0.5,
    tick: () => {
      const heroCell = game.cellFromPoint(hero)
      const moveAvailableCell = heroCellToMoveCell(heroCell)
      if (moveAvailableCell) {
        const destinationPoint = cellToCellCenter(moveAvailableCell)
        const moveAllowed = testMoveTo(hero, destinationPoint)
        if (moveAllowed) {
          moveAvailableHint.fillStyle = "green"
          moveAvailableHint.move(moveAvailableCell)
          return
        }
      }

      moveAvailableHint.fillStyle = "transparent"
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
  const collision = someOtherUnitCollides(unit)
  unit.move(currentPosition)
  return !collision
}

const someOtherUnitCollides = (unit) => {
  return units.some((unitCandidate) => {
    return unitCandidate !== unit && unitCollidesWithUnit(unitCandidate, unit)
  })
}

const game = createGame({ units })
document.body.appendChild(game.canvas)

// game.render()
game.startRendering()

/*
TODO: pouvoir cliquer sur une case précédemment visité, le joueur s'y téléporte
*/
game.canvas.addEventListener("click", (clickEvent) => {
  const clickPoint = {
    x: clickEvent.offsetX,
    y: clickEvent.offsetY,
  }
  const destinationPoint = cellToCellCenter(game.cellFromPoint(clickPoint))
  const moveAllowed = testMoveTo(hero, destinationPoint)
  if (moveAllowed) {
    hero.move(destinationPoint)
  }
})
