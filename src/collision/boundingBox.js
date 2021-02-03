import { getVectorLength } from "src/geometry/vector.js"
import { rectangleToCorners } from "src/geometry/rectangle.js"

export const testBoundingBoxContact = (a, b) => {
  const aBoundingBox = getBoundingBox(a)
  if (!aBoundingBox) {
    return false
  }

  const bBoundingBox = getBoundingBox(b)
  if (!bBoundingBox) {
    return false
  }

  return testBoundingBoxShapeContact(aBoundingBox, bBoundingBox)
}

const getBoundingBox = (rigidBody) => {
  const { shapeName } = rigidBody
  if (shapeName === "circle") {
    return circleToBoundingCircle(rigidBody)
  }

  if (shapeName === "rectangle") {
    const { angle } = rigidBody
    if (angle === 0) {
      return rectangleToBoundingRectangle(rigidBody)
    }

    const { width, height } = rigidBody
    const rectangleAspectRatio = width > height ? width / height : height / width
    // when rectangle is almost squarish, the circle bounding box is a good approximation
    // and circle bounding box is cheaper to compute
    if (rectangleAspectRatio < 3) {
      return rectangleToBoundingCircle(rigidBody)
    }

    // for very small rectangle it's fine too to use a circle
    const rectangleArea = width * height
    if (rectangleArea < 6) {
      return rectangleToBoundingCircle(rigidBody)
    }

    return rotatedRectangleToBoundingRectangle(rigidBody)
  }

  return null
}

const testBoundingBoxShapeContact = (a, b) => {
  const aBoundingBoxShapeName = a.boundingBoxShapeName
  const bBoundingBoxShapeName = b.boundingBoxShapeName

  if (aBoundingBoxShapeName === "circle" && bBoundingBoxShapeName === "circle") {
    return circleHitCircle(a, b)
  }

  if (aBoundingBoxShapeName === "rectangle" && bBoundingBoxShapeName === "rectangle") {
    return rectangleHitRectangle(a, b)
  }

  if (aBoundingBoxShapeName === "circle" && bBoundingBoxShapeName === "rectangle") {
    return circleHitRectangle(a, b)
  }
  if (aBoundingBoxShapeName === "rectangle" && bBoundingBoxShapeName === "circle") {
    return circleHitRectangle(b, a)
  }

  return false
}

const circleHitCircle = (circleA, circleB) => {
  const centerDiff = {
    x: circleA.centerX - circleB.centerX,
    y: circleA.centerY - circleB.centerY,
  }
  const centerDistance = getVectorLength(centerDiff)
  const circleARadius = circleA.radius
  const circleBRadius = circleB.radius
  const radiusSum = circleARadius + circleBRadius

  if (centerDistance > radiusSum) {
    return false
  }

  return true
}

const rectangleHitRectangle = (rectangleA, rectangleB) => {
  // first left of second
  if (rectangleA.right <= rectangleB.left) {
    return false
  }

  // first right of second
  if (rectangleA.left >= rectangleB.right) {
    return false
  }

  // first above second
  if (rectangleA.bottom <= rectangleB.top) {
    return false
  }

  // first below second
  if (rectangleA.top >= rectangleB.bottom) {
    return false
  }

  return true
}

// http://www.jeffreythompson.org/collision-detection/circle-rect.php
const circleHitRectangle = (circle, rectangle) => {
  const circleRadius = circle.radius
  const circleCenterX = circle.centerX
  const circleCenterY = circle.centerY
  const rectangleLeft = rectangle.left
  const rectangleRight = rectangle.right
  const rectangleTop = rectangle.top
  const rectangleBottom = rectangle.bottom
  const closestX =
    circleCenterX < rectangleLeft
      ? rectangleLeft
      : circleCenterX > rectangleRight
      ? rectangleRight
      : circleCenterX
  const closestY =
    circleCenterY < rectangleTop
      ? rectangleTop
      : circleCenterY > rectangleBottom
      ? rectangleBottom
      : circleCenterY
  const distanceWithClosestX = circleCenterX - closestX
  const distanceWithClosestY = circleCenterY - closestY
  const distance = Math.sqrt(
    distanceWithClosestX * distanceWithClosestX + distanceWithClosestY * distanceWithClosestY,
  )

  if (distance <= circleRadius) {
    return true
  }

  return false
}

const circleToBoundingCircle = (circle) => {
  return {
    boundingBoxShapeName: "bounding-circle",
    centerX: circle.centerX,
    centerY: circle.centerY,
    radius: circle.radius,
  }
}

const rectangleToBoundingCircle = (rectangle) => {
  const rectangleWidth = rectangle.width
  const rectangleHeight = rectangle.height

  return {
    boundingBoxShapeName: "bounding-circle",
    centerX: rectangle.centerX,
    centerY: rectangle.centerY,
    radius: Math.sqrt(rectangleWidth * rectangleWidth + rectangleHeight * rectangleHeight) / 2,
  }
}

const rectangleToBoundingRectangle = ({ centerX, centerY, width, height }) => {
  const widthHalf = width / 2
  const heightHalf = height / 2

  return {
    boundingBoxShapeName: "rectangle",
    left: centerX - widthHalf,
    top: centerY - heightHalf,
    right: centerX + widthHalf,
    bottom: centerY + heightHalf,
  }
}

// https://jsfiddle.net/w8r/9rnnk545/
const rotatedRectangleToBoundingRectangle = (rectangle) => {
  const { topLeftCorner, topRightCorner, bottomRightCorner, bottomLeftCorner } = rectangleToCorners(
    rectangle,
  )

  const boundingRectangleLeft = Math.min(
    topLeftCorner.x,
    topRightCorner.x,
    bottomRightCorner.x,
    bottomLeftCorner.x,
  )
  const boundingRectangleTop = Math.min(
    topLeftCorner.y,
    topRightCorner.y,
    bottomRightCorner.y,
    bottomLeftCorner.y,
  )
  const boundingRectangleWidth = Math.max(
    topLeftCorner.x,
    topRightCorner.x,
    bottomRightCorner.x,
    bottomLeftCorner.x,
  )
  const boundingRectangleHeight = Math.max(
    topLeftCorner.y,
    topRightCorner.y,
    bottomRightCorner.y,
    bottomLeftCorner.y,
  )

  return {
    boundingBoxShapeName: "rectangle",
    left: boundingRectangleLeft,
    top: boundingRectangleTop,
    right: boundingRectangleLeft + boundingRectangleWidth,
    bottom: boundingRectangleTop + boundingRectangleHeight,
  }
}

// const circleToBoundingRectangle = (circle) => {
//   const { centerX, centerY, radius } = circle

//   return {
//     left: centerX - radius,
//     top: centerY - radius,
//     right: centerX + radius,
//     bottom: centerY + radius,
//   }
// }
