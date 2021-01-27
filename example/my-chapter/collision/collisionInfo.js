import { getScalarProduct } from "../geometry/vector.js"
import { testBoundingBoxContact } from "./boundingBox.js"
import { getCollisionInfoForCircleToCircle } from "./circleToCircle.js"
import { getCollisionInfoForRectangleToRectangle } from "./rectangleToRectangle.js"
import { getCollisionInfoForRectangleToCircle } from "./rectangleToCircle.js"

export const getCollisionInfo = (gameObject, otherGameObject) => {
  const boundingBoxContact = testBoundingBoxContact(gameObject, otherGameObject)
  if (!boundingBoxContact) {
    return null
  }

  const collisionInfo = getRawCollisionInfo(gameObject, otherGameObject)

  if (!collisionInfo) {
    return null
  }

  const collisionNormal = {
    x: collisionInfo.normalX,
    y: collisionInfo.normalY,
  }
  const centerDiff = {
    x: otherGameObject.centerX - gameObject.centerX,
    y: otherGameObject.centerY - gameObject.centerY,
  }

  if (getScalarProduct(collisionNormal, centerDiff) < 0) {
    return getOppositeCollisionInfo(collisionInfo)
  }

  return collisionInfo
}

export const createCollisionInfo = ({
  depth = 0,
  normalX = 0,
  normalY = 0,
  startX = 0,
  startY = 0,
  endX = startX + normalX * depth,
  endY = startY + normalY * depth,
}) => {
  return {
    depth,
    startX,
    startY,
    endX,
    endY,
    normalX,
    normalY,
  }
}

const getRawCollisionInfo = (gameObject, otherGameObject) => {
  const shape = gameObject.shape
  const otherShape = otherGameObject.shape

  if (shape === "circle" && otherShape === "circle") {
    return getCollisionInfoForCircleToCircle(gameObject, otherGameObject)
  }

  if (shape === "rectangle" && otherShape === "rectangle") {
    return getCollisionInfoForRectangleToRectangle(gameObject, otherGameObject)
  }

  if (shape === "rectangle" && otherShape === "circle") {
    return getCollisionInfoForRectangleToCircle(gameObject, otherGameObject)
  }
  if (shape === "circle" && otherShape === "rectangle") {
    return getCollisionInfoForRectangleToCircle(otherGameObject, gameObject)
  }

  return null
}

const getOppositeCollisionInfo = ({ depth, normalX, normalY, startX, startY, endX, endY }) => {
  return {
    depth,
    normalX: normalX * -1,
    normalY: normalY * -1,
    startX: endX,
    startY: endY,
    endX: startX,
    endY: startY,
  }
}
