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
  moveBlocIfAllowed(hero, {
    positionX: destinationPoint.x,
    positionY: destinationPoint.y,
  })
})
game.canvas.setAttribute("tabindex", -1)
game.canvas.addEventListener("keydown", (keydownEvent) => {
  if (keydownEvent.code === "ArrowDown") {
    moveBlocIfAllowed(hero, {
      positionY: hero.positionY + 1,
    })
  }
  if (keydownEvent.code === "ArrowUp") {
    moveBlocIfAllowed(hero, {
      positionY: hero.positionY - 1,
    })
  }
  if (keydownEvent.code === "ArrowLeft") {
    moveBlocIfAllowed(hero, {
      positionX: hero.positionX - 1,
    })
  }
  if (keydownEvent.code === "ArrowRight") {
    moveBlocIfAllowed(hero, {
      positionX: hero.positionX + 1,
    })
  }
})

const moveBlocIfAllowed = (bloc, { positionX = bloc.positionX, positionY = bloc.positionY }) => {
  const currentPosition = {
    positionX: bloc.positionX,
    positionY: bloc.positionY,
  }
  mutateBloc(bloc, { positionX, positionY })
  const blocCollidingArray = blocCollidingArrayGetter(bloc, blocs)
  if (blocCollidingArray.length > 0) {
    mutateBloc(bloc, currentPosition)
  }
}

window.blocs = blocs
