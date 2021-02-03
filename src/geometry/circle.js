import { rotateVector } from "./vector.js"

export const createCircle = ({ radius = 0, centerX = 0, centerY = 0, angle = 0 }) => {
  return {
    shapeName: "circle",
    radius,
    centerX,
    centerY,
    angle,
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
