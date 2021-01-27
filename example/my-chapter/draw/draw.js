import { rectangleToCorners } from "../geometry/rectangle.js"
import { circleToStartPoint } from "../geometry/circle.js"

export const drawRectangle = ({ centerX, centerY, width, height, angle }, context) => {
  const { topLeftCorner } = rectangleToCorners({
    centerX,
    centerY,
    width,
    height,
    angle,
  })
  context.save()
  context.translate(topLeftCorner.x, topLeftCorner.y)
  context.rotate(angle)
  context.strokeRect(0, 0, width, height)
  context.restore()
}

export const drawCircle = ({ centerX, centerY, radius, angle }, context) => {
  const startPoint = circleToStartPoint({ centerX, centerY, radius, angle })

  context.beginPath()
  // draw a circle
  context.arc(centerX, centerY, radius, 0, Math.PI * 2, true)
  // draw a line from start point toward center
  context.moveTo(startPoint.x, startPoint.y)
  context.lineTo(centerX, centerY)
  context.closePath()
  context.stroke()
}

export const drawCollisionInfo = (
  { collisionStartX, collisionStartY, collisionEndX, collisionEndY },
  context,
) => {
  context.beginPath()
  context.moveTo(collisionStartX, collisionStartY)
  context.lineTo(collisionEndX, collisionEndY)
  context.closePath()
  context.strokeStyle = "orange"
  context.stroke()
}
