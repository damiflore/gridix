import { GameObject } from "../gameObject.js"
import { rotateVector } from "../geometry/vector.js"

export const createCircle = ({ centerX, centerY, radius, ...props }) => {
  return {
    ...GameObject,
    shape: "circle",
    centerX,
    centerY,
    radius,
    ...props,
  }
}

export const circleToStartPoint = ({ centerX, centerY, radius, angle }) => {
  return rotateVector(
    {
      x: centerX,
      y: centerY - radius,
    },
    { centerX, centerY, angle },
  )
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
