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
import { createRectangle, cellToRectangleGeometry } from "src/unit/unit.rectangle.js"
import { createCircle, cellToCircleGeometry } from "src/unit/unit.circle.js"

window.splashscreen.remove()

const createFloorAtCell = ({ row, column }) => {
  return createRectangle(cellToRectangleGeometry({ row, column }), {
    solid: false,
    fillStyle: "white",
  })
}

const createWallAtCell = ({ row, column }) => {
  return createRectangle(cellToRectangleGeometry({ row, column }), {
    solid: true,
    fillStyle: "grey",
  })
}

const createHeroAtCell = ({ row, column, radius = 12 }) => {
  const hero = createCircle(cellToCircleGeometry({ row, column, radius }), {
    fillStyle: "red",
  })
  return hero
}

const createGame = ({ rowCount = 3, columnCount = 3 } = {}) => {
  const hero = createHeroAtCell({ row: 0, column: 0 })
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
    hero,
  ]

  const canvas = createCanvas({
    width: CELL_SIZE * columnCount,
    height: CELL_SIZE * rowCount,
  })
  const context = canvas.getContext("2d")

  const render = () => {
    context.clearRect(0, 0, canvas.width, canvas.height)
    units.forEach((unit) => {
      unit.draw(context)
    })
  }

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

  return {
    canvas,
    render,
    startRendering,
    unitsFromPoint,
    hero,
  }
}

const createCanvas = ({ width, height }) => {
  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height
  return canvas
}

const game = createGame()
document.body.appendChild(game.canvas)

// game.render()
game.startRendering()

/*
next step:
ne pas pouvoir se rendre sur une case si un élement est entre le joueur et sa destination (collision)
en imaginant que le joueur veut se déplacer en ligne droite vers cette destination

ne pouvoir click que autour du joueur (1 case)
et mettre en évidence ces cases.

pour voir cliquer sur une case précédemment visité, le joueur s'y téléporte

*/
game.canvas.addEventListener("click", (clickEvent) => {
  const clickPoint = {
    x: clickEvent.offsetX,
    y: clickEvent.offsetY,
  }
  const unitsUnderClick = game.unitsFromPoint(clickPoint)
  const heroUnderClick = unitsUnderClick.some((unit) => game.hero === unit)
  if (heroUnderClick) {
    return
  }
  const wallUnderClick = unitsUnderClick.some((unit) => unit.solid)
  if (wallUnderClick) {
    return
  }
  // on le bouge au centre de la cellule la plus proche!
  const cellAtClick = cellFromPoint(clickPoint)
  game.hero.move({
    x: cellAtClick.x + CELL_SIZE / 2,
    y: cellAtClick.y + CELL_SIZE / 2,
  })
})

const cellFromPoint = ({ x, y }) => {
  return {
    x: Math.floor(x / CELL_SIZE) * CELL_SIZE,
    y: Math.floor(y / CELL_SIZE) * CELL_SIZE,
  }
}
