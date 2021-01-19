/*

Pour chaque unit on pourrait mettre une hitbox
qui est différente de la vraie forme de l'objet

une hitbox serait par défaut soit rectangle soit cercle
pour faciliter la détection de collision
on pourrait avoir plusieurs hitbox pour un seul objet aussi

*/

import { CELL_SIZE } from "src/game.constant.js"
import { createUnit, drawPathStyle } from "src/unit/unit.js"

export const createCircle = ({ x, y, radius }, { fillStyle = "violet" }) => {
  const circle = {
    x,
    y,
    radius,
    fillStyle,

    move: ({ x = circle.x, y = circle.y }) => {
      circle.x = x
      circle.y = y
      circle.path = createPathForCircle(circle)
    },

    draw: (context) => {
      drawPathStyle(context, circle.path, circle)
    },
  }
  circle.path = createPathForCircle(circle)
  return createUnit(circle)
}

const createPathForCircle = ({ x, y, radius }) => {
  const path = new Path2D()
  path.arc(x, y, radius, 0, 2 * Math.PI)
  path.closePath()
  return path
}

export const cellToCircleGeometry = ({ row, column, radius = CELL_SIZE / 2 }) => {
  return {
    x: row * CELL_SIZE + CELL_SIZE / 2,
    y: column * CELL_SIZE + CELL_SIZE / 2,
    radius,
  }
}
