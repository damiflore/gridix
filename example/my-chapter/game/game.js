import { pointHitCircle } from "../collision/pointHitCircle.js"
import { pointHitRectangle } from "../collision/pointHitRectangle.js"

export const gameObjectFromPoint = (gameObjects, point) => {
  const gameObjectsAtPoint = gameObjectsFromPoint(gameObjects, point)
  // ideally get the once with highest z-index
  return gameObjectsAtPoint[gameObjectsAtPoint.length - 1]
}

export const gameObjectsFromPoint = (gameObjects, point) => {
  return gameObjects.filter((gameObject) => pointHitGameObject(point, gameObject))
}

const pointHitGameObject = (point, gameObject) => {
  if (gameObject.shape === "circle") {
    return pointHitCircle(point, gameObject)
  }

  if (gameObject.shape === "rectangle") {
    return pointHitRectangle(point, gameObject)
  }

  return false
}
