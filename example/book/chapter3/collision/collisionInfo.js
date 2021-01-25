import { getCollisionInfoForCircleToCircle } from "./circleToCircle.js"
import { getCollisionInfoForRectangleToRectangle } from "./rectangleToRectangle.js"
import { getCollisionInfoForRectangleToCircle } from "./rectangleToCircle.js"

export const getGameObjectCollisionInfo = (gameObject, otherGameObject) => {
  if (gameObject.shape === "circle" && otherGameObject.shape === "circle") {
    return getCollisionInfoForCircleToCircle(gameObject, otherGameObject)
  }
  if (gameObject.shape === "rectangle" && otherGameObject.shape === "rectangle") {
    return getCollisionInfoForRectangleToRectangle(gameObject, otherGameObject)
  }
  if (gameObject.shape === "rectangle" && otherGameObject.shape === "circle") {
    return getCollisionInfoForRectangleToCircle(gameObject, otherGameObject)
  }
  if (gameObject.shape === "circle" && otherGameObject.shape === "rectangle") {
    return getCollisionInfoForRectangleToCircle(otherGameObject, gameObject)
  }
  return null
}

export const getOppositeCollisionInfo = ({
  depth,
  normalX,
  normalY,
  startX,
  startY,
  endX,
  endY,
}) => {
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
