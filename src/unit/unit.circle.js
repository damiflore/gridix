/*

Pour chaque unit on pourrait mettre une hitbox
qui est différente de la vraie forme de l'objet

une hitbox serait par défaut soit rectangle soit cercle
pour faciliter la détection de collision
on pourrait avoir plusieurs hitbox pour un seul objet aussi

*/

import { CELL_SIZE } from "src/game.constant.js"
import { createUnit, drawPathStyle } from "src/unit/unit.js"

export const createCircle = ({
  isSolid = true,
  isColliding = false,
  isBounceEnabled = false,
  mass = 1,
  // describes how much energy is left after each collision.
  // It has an effect on the bounciness of objects
  restitution = 0.9,
  vx = 0,
  vy = 0,
  x,
  y,
  radius,
  fillStyle = "violet",
  opacity,
  tick = () => {},
}) => {
  const circle = {
    isSolid,
    isColliding,
    isBounceEnabled,
    mass,
    restitution,
    vx,
    vy,
    x,
    y,
    radius,
    fillStyle,
    opacity,
    tick,

    move: ({ x = circle.x, y = circle.y }) => {
      circle.x = x
      circle.y = y
      circle.path = createPathForCircle(circle)
    },

    draw: (context) => {
      drawPathStyle(context, circle)
    },
  }
  circle.path = createPathForCircle(circle)
  circle.hitboxes = [circle]

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
