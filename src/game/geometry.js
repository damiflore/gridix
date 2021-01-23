export const getDistanceBetweenTwoPoints = (firstPoint, secondPoint) => {
  const horizontalDiff = firstPoint.x - secondPoint.x
  const verticalDiff = firstPoint.y - secondPoint.y
  const horizontalDiffSquared = horizontalDiff * horizontalDiff
  const verticalDiffSquared = verticalDiff * verticalDiff
  const distance = Math.sqrt(horizontalDiffSquared + verticalDiffSquared)

  return distance
}

export const blocToCenterPoint = ({ positionX, positionY, width, height }) => {
  return {
    x: positionX + width / 2,
    y: positionY + height / 2,
  }
}

export const blocToMoveDirection = ({ velocityX, velocityY }) => {
  return {
    movingLeft: velocityX < 0,
    movingTop: velocityY < 0,
    movingRight: velocityX > 0,
    movingBottom: velocityY > 0,
  }
}

export const blocCollidesWithBloc = (firstBloc, secondBloc) => {
  if (!firstBloc.canCollide) {
    return false
  }

  if (!secondBloc.canCollide) {
    return false
  }

  return rectangleCollidesRectangle(firstBloc, secondBloc)
}

export const rectangleCollidesRectangle = (firstRectangle, secondRectangle) => {
  const firstLeft = firstRectangle.positionX
  const firstRight = firstLeft + firstRectangle.width
  const secondLeft = secondRectangle.positionX
  // first left of second
  if (firstRight <= secondLeft) {
    return false
  }

  const secondRight = secondLeft + secondRectangle.width
  // first right of second
  if (firstLeft >= secondRight) {
    return false
  }

  const firstTop = firstRectangle.positionY
  const firstBottom = firstTop + firstRectangle.height
  const secondTop = secondRectangle.positionY
  // first above second
  if (firstBottom <= secondTop) {
    return false
  }

  const secondBottom = secondTop + secondRectangle.height
  // first below second
  if (firstTop >= secondBottom) {
    return false
  }

  return true
}
