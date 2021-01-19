export const degreesToRadians = (degrees) => (degrees * Math.PI) / 180

export const radiansToDegree = (radians) => Math.round(radians * (180 / Math.PI))

export const rotatePoint = (origin, point, degrees) => {
  const radians = degreesToRadians(degrees)
  const cosinus = Math.cos(radians)
  const sinus = Math.sin(radians)
  const run = point.x - origin.x
  const rise = point.y - origin.y

  return {
    x: Math.round(cosinus * run + sinus * rise + origin.x),
    y: Math.round(cosinus * rise - sinus * run + origin.y),
  }
}

export const rotateRectangle = (points, degree, origin = getRectangleCenterPoint(points)) => {
  return points.map((point) => rotatePoint(origin, point, degree))
}

export const getDistanceBetweenTwoPoints = (firstPoint, secondPoint) => {
  const horizontalDiff = firstPoint.x - secondPoint.x
  const verticalDiff = firstPoint.y - secondPoint.y
  return Math.sqrt(horizontalDiff * horizontalDiff + verticalDiff * verticalDiff)
}

export const getRectangleCenterPoint = ([topLeft, topRight, bottomRight, bottomLeft]) => {
  return {
    x: (topLeft.x + topRight.x + bottomRight.x + bottomLeft.x) / 4,
    y: (topLeft.y + topRight.y + bottomRight.y + bottomLeft.y) / 4,
  }
}
