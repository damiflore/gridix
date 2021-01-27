import { pointHitCircle } from "../collision/pointHitCircle.js"
import { pointHitRectangle } from "../collision/pointHitRectangle.js"

export const gameObjectFromPoint = (gameObjects, point) => {
  // ideally get the once with highest z-index
  return gameObjectsFromPoint(gameObjects, point)[0]
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
