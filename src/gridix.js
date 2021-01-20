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

import { createGame } from "src/game/game.js"
import { Bloc, mutateBloc } from "src/game/bloc.js"
import { blocCollidingArrayGetter } from "src/game/bloc.effects.js"
import { CELL_SIZE } from "src/game.constant.js"

window.splashscreen.remove()

const cellToRectangleGeometry = ({ row, column }) => {
  return {
    positionX: column * CELL_SIZE,
    positionY: row * CELL_SIZE,
    width: CELL_SIZE,
    height: CELL_SIZE,
  }
}

const createFloorAtCell = ({ row, column }) => {
  return {
    ...Bloc,
    name: "floor",
    ...cellToRectangleGeometry({ row, column }),
    fillStyle: "white",
  }
}

const createWallAtCell = ({ row, column }) => {
  return {
    ...Bloc,
    name: "wall",
    ...cellToRectangleGeometry({ row, column }),
    canCollide: true,
    fillStyle: "grey",
  }
}

const createHeroAtCell = ({ row, column }) => {
  const hero = {
    ...Bloc,
    name: "hero",
    ...cellToRectangleGeometry({ row, column }),
    canCollide: true,
    fillStyle: "red",
  }
  return hero
}

const blocs = [
  createFloorAtCell({ row: 0, column: 0 }),
  createFloorAtCell({ row: 1, column: 0 }),
  createFloorAtCell({ row: 2, column: 0 }),
  createWallAtCell({ row: 0, column: 1 }),
  createWallAtCell({ row: 1, column: 1 }),
  createFloorAtCell({ row: 2, column: 1 }),
  createWallAtCell({ row: 0, column: 2 }),
  createFloorAtCell({ row: 1, column: 2 }),
  createFloorAtCell({ row: 2, column: 2 }),
]

const hero = createHeroAtCell({ row: 0, column: 0 })
blocs.push(hero)

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

  const moveAvailableHint = {
    ...Bloc,
    name: "move-hint",
    positionX: 0,
    positionY: 0,
    z: 10,
    width: CELL_SIZE,
    height: CELL_SIZE,
    fillStyle: "transparent",
    opacity: 0.5,
    updates: {
      ...Bloc.updates,
      movehint: () => {
        const heroCell = cellFromBloc(hero)
        const moveAvailableCell = heroCellToMoveCell(heroCell)
        if (moveAvailableCell) {
          const moveAllowed = testMoveTo(hero, moveAvailableCell)
          if (moveAllowed) {
            return {
              positionX: moveAvailableCell.x,
              positionY: moveAvailableCell.y,
              fillStyle: "green",
            }
          }
        }

        return {
          fillStyle: undefined,
        }
      },
    },
  }
  blocs.push(moveAvailableHint)
})

const testMoveTo = (bloc, { x, y }) => {
  const currentPosition = {
    positionX: bloc.positionX,
    positionY: bloc.positionY,
  }
  mutateBloc(bloc, { positionX: x, positionY: y })
  const blocCollidingArray = blocCollidingArrayGetter(bloc, blocs)
  mutateBloc(bloc, currentPosition)
  return blocCollidingArray.length === 0
}

const cellFromBloc = ({ positionX, positionY }) => {
  return cellFromPoint({
    x: positionX,
    y: positionY,
  })
}

const cellFromPoint = ({ x, y }) => {
  return {
    x: Math.floor(x / CELL_SIZE) * CELL_SIZE,
    y: Math.floor(y / CELL_SIZE) * CELL_SIZE,
  }
}

const game = createGame({
  worldContainer: true,
  worldWidth: 3 * CELL_SIZE,
  worldHeight: 3 * CELL_SIZE,
  blocs,
})
document.body.appendChild(game.canvas)

game.start()

game.canvas.addEventListener("click", (clickEvent) => {
  const clickPoint = {
    x: clickEvent.offsetX,
    y: clickEvent.offsetY,
  }
  const destinationPoint = cellFromPoint(clickPoint)
  const moveAllowed = testMoveTo(hero, destinationPoint)
  if (moveAllowed) {
    mutateBloc(hero, {
      positionX: destinationPoint.x,
      positionY: destinationPoint.y,
    })
  }
})

window.blocs = blocs
