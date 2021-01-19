import { CELL_SIZE } from "src/game.constant.js"
import { createUnit, drawPathStyle } from "src/unit/unit.js"

export const createRectangle = ({
  isSolid = true,
  isColliding = false,
  isBounceEnabled = false,
  mass = 1,
  restitution = 0.9,
  vx = 0,
  vy = 0,
  x,
  y,
  width,
  height,
  fillStyle = "violet",
  opacity,
  tick = () => {},
  onCollision,
}) => {
  const rectangle = {
    isSolid,
    isColliding,
    isBounceEnabled,
    mass,
    restitution,
    x,
    y,
    vx,
    vy,
    width,
    height,
    fillStyle,
    opacity,
    tick,
    onCollision,

    move: ({ x = rectangle.x, y = rectangle.y }) => {
      rectangle.x = x
      rectangle.y = y
      rectangle.path = createPathForPolygon(rectangleToPoints(rectangle))
    },

    resize: ({ width = rectangle.width, height = rectangle.height }) => {
      rectangle.width = width
      rectangle.height = height
      rectangle.path = createPathForPolygon(rectangleToPoints(rectangle))
    },

    draw: (context) => {
      drawPathStyle(context, rectangle)
    },
  }
  rectangle.path = createPathForPolygon(rectangleToPoints(rectangle))
  rectangle.hitboxes = [rectangle]

  return createUnit(rectangle)
}

const createPathForPolygon = (points) => {
  const path = new Path2D()
  const firstPoint = points[0]
  path.moveTo(firstPoint.x, firstPoint.y)
  points.slice(1).forEach((nextPoint) => {
    path.lineTo(nextPoint.x, nextPoint.y)
  })
  path.closePath()
  return path
}

export const cellToRectangleGeometry = ({ row, column, width = CELL_SIZE, height = CELL_SIZE }) => {
  return {
    x: row * CELL_SIZE,
    y: column * CELL_SIZE,
    width,
    height,
  }
}

export const rectangleToPoints = ({ x, y, width, height }) => {
  return [
    { x, y },
    { x: x + width, y },
    { x: x + width, y: y + height },
    { x, y: y + height },
  ]
}
