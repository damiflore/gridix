export const createCircle = ({ center, radius }) => {
  return { center, radius }
}

export const circleToStartPoint = ({ center, radius }) => {
  return {
    x: center.x,
    y: center.y - radius,
  }
}

export const drawCircle = ({ center, radius }, context) => {
  const startPoint = circleToStartPoint({ center, radius })

  context.beginPath()
  // draw a circle
  context.arc(center.x, center.y, radius, 0, Math.PI * 2, true)
  // draw a line from start point toward center
  context.moveTo(startPoint.x, startPoint.y)
  context.lineTo(center.x, center.y)
  context.closePath()
  context.stroke()
}
