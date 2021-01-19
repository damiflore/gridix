// https://github.com/davidfig/intersects/blob/master/lineToLine.js
export const lineCollidesWithLine = (
  [firstLineStartPoint, firstLineEndPoint],
  [secondLineStartPoint, secondLineEndPoint],
) => {
  let unknownA =
    (secondLineEndPoint.x - secondLineStartPoint.x) *
      (firstLineStartPoint.y - secondLineStartPoint.y) -
    (secondLineEndPoint.y - secondLineStartPoint.y) *
      (firstLineStartPoint.x - secondLineStartPoint.x)
  let unknownB =
    (firstLineEndPoint.x - firstLineStartPoint.x) *
      (firstLineStartPoint.y - secondLineStartPoint.y) -
    (firstLineEndPoint.y - firstLineStartPoint.y) * (firstLineStartPoint.x - secondLineStartPoint.x)
  const denominator =
    (secondLineEndPoint.y - secondLineStartPoint.y) *
      (firstLineEndPoint.x - firstLineStartPoint.x) -
    (secondLineEndPoint.x - secondLineStartPoint.x) * (firstLineEndPoint.y - firstLineStartPoint.y)

  // Test if Coincident
  // If the denominator and numerator for the ua and ub are 0
  // then the two lines are coincident.
  if (unknownA === 0 && unknownB === 0 && denominator === 0) {
    return false
  }

  // Test if Parallel
  // If the denominator for the equations for ua and ub is 0
  // then the two lines are parallel.
  if (denominator === 0) {
    return false
  }

  // test if line segments are colliding
  unknownA /= denominator
  unknownB /= denominator
  const isIntersecting = unknownA >= 0 && unknownA <= 1 && unknownB >= 0 && unknownB <= 1

  return isIntersecting
}

export const rotatedRectangleCollidesWithRotatedRectangle = (
  firstRotatedRectangle,
  secondRotatedRectangle,
) => {
  return someRectangleSideLine(firstRotatedRectangle, (firstRotatedRectangleSideLine) => {
    return lineCollidesWithRectangle(firstRotatedRectangleSideLine, secondRotatedRectangle)
  })
}

// https://riptutorial.com/html5-canvas/example/17710/are-line-segment-and-rectangle-colliding-
export const lineCollidesWithRectangle = (line, rectangle) => {
  const lineIntersects = someRectangleSideLine(rectangle, (rectangleSideLine) =>
    lineCollidesWithLine(line, rectangleSideLine),
  )
  if (lineIntersects) {
    return true
  }
  // TODO: here we should check if line is contained inside the rectangle because in that case
  // it's not intersecting but it's colliding
  return false
}

const someRectangleSideLine = ([firstPoint, secondPoint, thirdPoint, fourthPoint], predicate) => {
  const rectangleFirstLine = [firstPoint, secondPoint]
  if (predicate(rectangleFirstLine)) return true
  const rectangleSecondLine = [secondPoint, thirdPoint]
  if (predicate(rectangleSecondLine)) return true
  const rectangleThirdLine = [thirdPoint, fourthPoint]
  if (predicate(rectangleThirdLine)) return true
  const rectangleFourthLine = [fourthPoint, firstPoint]
  if (predicate(rectangleFourthLine)) return true
  return false
}
