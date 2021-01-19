import { getDistanceBetweenTwoPoints } from "./geometry.js"

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

// https://codepen.io/JChehe/pen/dWmYjO?editors=1010

export const rectangleCollidesWithRectangle = (firstRectangle, secondRectangle) => {
  const firstRectangleRight = firstRectangle[1].x
  const secondRectangleLeft = secondRectangle[0].x
  // first left of second
  if (firstRectangleRight <= secondRectangleLeft) {
    return false
  }

  const firstRectangleLeft = firstRectangle[0].x
  const secondRectangleRight = secondRectangle[1].x
  // first right of second
  if (firstRectangleLeft >= secondRectangleRight) {
    return false
  }

  const firstRectangleBottom = firstRectangle[2].y
  const secondRectangleTop = secondRectangle[0].y
  // first above second
  if (firstRectangleBottom <= secondRectangleTop) {
    return false
  }

  const firstRectangleTop = firstRectangle[0].y
  const secondRectangleBottom = secondRectangle[2].y
  // first below second
  if (firstRectangleTop >= secondRectangleBottom) {
    return false
  }

  return true
}

export const circleCollidesWithRectangle = (circle, rectangle) => {
  let closestRectanglePointX
  let closestRectanglePointY

  const rectangleTopLeftPoint = rectangle[0]
  const rectangleTopRightPoint = rectangle[1]
  const rectangleBottomRightPoint = rectangle[2]

  if (circle.x < rectangleTopLeftPoint.x) {
    closestRectanglePointX = rectangleTopLeftPoint.x
  } else if (circle.x > rectangleTopRightPoint.x) {
    closestRectanglePointX = rectangleTopRightPoint.x
  }
  if (circle.y < rectangleTopLeftPoint.y) {
    closestRectanglePointY = rectangleTopLeftPoint.y
  } else if (circle.y > rectangleBottomRightPoint.y) {
    closestRectanglePointY = rectangleBottomRightPoint.y
  }

  return pointCollidesWithCircle({ x: closestRectanglePointX, y: closestRectanglePointY }, circle)
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
  if (predicate(rectangleFirstLine)) {
    return true
  }

  const rectangleSecondLine = [secondPoint, thirdPoint]
  if (predicate(rectangleSecondLine)) {
    return true
  }

  const rectangleThirdLine = [thirdPoint, fourthPoint]
  if (predicate(rectangleThirdLine)) {
    return true
  }

  const rectangleFourthLine = [fourthPoint, firstPoint]
  if (predicate(rectangleFourthLine)) {
    return true
  }

  return false
}

export const circleCollidesWithCircle = (firstCircle, secondCircle) => {
  // Calculate the distance between the two circles
  const squareDistance = getDistanceBetweenTwoPoints(firstCircle, secondCircle)
  const radiusSum = firstCircle.radius + secondCircle.radius

  // When the distance is smaller or equal to the sum
  // of the two radius, the circles touch or overlap
  return squareDistance <= radiusSum * radiusSum
}

// point and triangle
// http://www.jeffreythompson.org/collision-detection/tri-point.php

export const lineCollidesWithCircle = () => {
  // TODO
}

export const pointCollidesWithCircle = (point, circle) => {
  const distanceBetweenPointAndCircleCenter = getDistanceBetweenTwoPoints(point, circle)
  if (distanceBetweenPointAndCircleCenter <= circle.radius) {
    return true
  }
  return false
}

export const pointCollidesWithLine = (point, line) => {
  const distanceWithLineStart = getDistanceBetweenTwoPoints(point, line[0])
  const distanceWithLineEnd = getDistanceBetweenTwoPoints(point, line[1])

  const lineLength = getDistanceBetweenTwoPoints(line[0], line[1])

  // if the two distances are equal to the line length, point is one the line
  if (
    distanceWithLineStart + distanceWithLineEnd >= lineLength - 0.1 &&
    distanceWithLineStart + distanceWithLineEnd <= lineLength + 0.1
  ) {
    return true
  }

  return false
}
