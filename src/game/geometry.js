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

export const blocCollidesWithBloc = (firstBloc, secondBloc) => {
  if (!firstBloc.canCollide) {
    return false
  }

  if (!secondBloc.canCollide) {
    return false
  }

  const firstBlocLeft = firstBloc.positionX
  const firstBlocRight = firstBlocLeft + firstBloc.width
  const secondBlocLeft = secondBloc.positionX
  // first left of second
  if (firstBlocRight <= secondBlocLeft) {
    return false
  }

  const secondBlocRight = secondBlocLeft + secondBloc.width
  // first right of second
  if (firstBlocLeft >= secondBlocRight) {
    return false
  }

  const firstBlocTop = firstBloc.positionY
  const firstBlocBottom = firstBlocTop + firstBloc.height
  const secondBlocTop = secondBloc.positionY
  // first above second
  if (firstBlocBottom <= secondBlocTop) {
    return false
  }

  const secondBlocBottom = secondBlocTop + secondBloc.height
  // first below second
  if (firstBlocTop >= secondBlocBottom) {
    return false
  }

  return true
}
