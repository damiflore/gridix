import { rectangleToTopLeftCorner } from "src/geometry/rectangle.js"
import { circleToStartPoint } from "src/geometry/circle.js"

export const drawPath = (gameObject, context) => {
  if (gameObject.shapeName === "rectangle") {
    drawRectanglePath(gameObject, context)
    return
  }

  if (gameObject.shapeName === "circle") {
    drawCirclePath(gameObject, context)
    return
  }
}

export const drawRectanglePath = (rectangle, context) => {
  const topLeftCorner = rectangleToTopLeftCorner(rectangle)
  const { width, height, angle } = rectangle

  context.beginPath()
  context.translate(topLeftCorner.x, topLeftCorner.y)
  context.rotate(angle)
  context.rect(0, 0, width, height)
  context.closePath()
}

export const drawCirclePath = (circle, context) => {
  const startPoint = circleToStartPoint(circle)
  const { centerX, centerY, radius } = circle

  context.beginPath()
  // draw a circle
  context.arc(centerX, centerY, radius, 0, Math.PI * 2, true)
  // draw a line from start point toward center
  context.moveTo(startPoint.x, startPoint.y)
  context.lineTo(centerX, centerY)
  context.closePath()
}
