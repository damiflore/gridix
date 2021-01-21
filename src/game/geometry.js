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

  // le bloc a une positionZ, il ne peut collisioner que avec ce qui est a le meme hauteur ?
  // en vrai un partirais du principe qu'un bloc a une hauteur Z de CELL_SIZE
  // et donc collisionne dans certains cas, pour le moment on ignore
  // if (firstBloc.positionZ !== secondBloc.positionZ) {
  //   return false
  // }

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
