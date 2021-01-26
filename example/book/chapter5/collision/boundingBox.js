/* eslint-disable no-nested-ternary */
import { getVectorLength } from "../vector.js"
import { rectangleToCorners } from "../rectangle.js"

export const testGameObjectBoundingBox = (a, b) => {
  const aBoundingBox = getGameObjectBoundingBox(a)
  if (!aBoundingBox) {
    return false
  }

  const bBoundingBox = getGameObjectBoundingBox(b)
  if (!bBoundingBox) {
    return false
  }

  return testBoundingBoxCollision(aBoundingBox, bBoundingBox)
}

const getGameObjectBoundingBox = (gameObject) => {
  const { boundingBox } = gameObject

  if (boundingBox === "auto") {
    const { shape } = gameObject
    if (shape === "circle") {
      return getBoundingCircle(gameObject)
    }

    if (shape === "rectangle") {
      const { angle } = gameObject
      if (angle === 0) {
        return rectangleToBoundingRectangle(gameObject)
      }
      return rotatedRectangleToBoundingRectangle(gameObject)
    }

    return null
  }

  return null
}

const testBoundingBoxCollision = (a, b) => {
  if (a.shape === "circle" && b.shape === "circle") {
    return circleHitCircle(a, b)
  }

  if (a.shape === "rectangle" && b.shape === "rectangle") {
    return rectangleHitRectangle(a, b)
  }

  if (a.shape === "circle" && b.shape === "rectangle") {
    return circleHitRectangle(a, b)
  }
  if (a.shape === "rectangle" && b.shape === "circle") {
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

const getBoundingCircle = (gameObject) => {
  if (gameObject.shape === "circle") {
    return circleToBoundingCircle(gameObject)
  }

  if (gameObject.shape === "rectangle") {
    return rectangleToBoundingCircle(gameObject)
  }

  return null
}

const circleToBoundingCircle = (circle) => {
  return {
    shape: "circle",
    centerX: circle.centerX,
    centerY: circle.centerY,
    radius: circle.radius,
  }
}

const rectangleToBoundingCircle = (rectangle) => {
  const rectangleWidth = rectangle.width
  const rectangleHeight = rectangle.height

  return {
    shape: "circle",
    centerX: rectangle.centerX,
    centerY: rectangle.centerY,
    radius: Math.sqrt(rectangleWidth * rectangleWidth + rectangleHeight * rectangleHeight) / 2,
  }
}

const rectangleToBoundingRectangle = ({ centerX, centerY, width, height }) => {
  const widthHalf = width / 2
  const heightHalf = height / 2

  return {
    shape: "rectangle",
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
    shape: "rectangle",
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
