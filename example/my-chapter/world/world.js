import { pointHitCircle } from "../collision/pointHitCircle.js"
import { pointHitRectangle } from "../collision/pointHitRectangle.js"
import { createRectangle } from "./shape.js"

export const createWorld = () => {
  const gameObjects = []
  const world = {}

  const addGameObject = (gameObject) => {
    gameObjects.push(gameObject)
  }

  const countGameObjects = () => {
    return gameObjects.length
  }

  const removeGameObject = (gameObject) => {
    const index = gameObjects.indexOf(gameObject)
    if (index > -1) {
      gameObjects.splice(index, 1)
    }
  }

  const forEachGameObject = (fn) => {
    gameObjects.forEach(fn)
  }

  const gameObjectFromPoint = (point) => {
    const gameObjectsAtPoint = gameObjectsFromPoint(gameObjects, point)
    // ideally get the once with highest z-index
    return gameObjectsAtPoint[gameObjectsAtPoint.length - 1]
  }

  const gameObjectsFromPoint = (point) => {
    return gameObjects.filter((gameObject) => pointHitGameObject(point, gameObject))
  }

  const getGameObjects = () => gameObjects

  Object.assign(world, {
    getGameObjects,
    addGameObject,
    countGameObjects,
    forEachGameObject,
    removeGameObject,
    gameObjectFromPoint,
    gameObjectsFromPoint,
  })

  return world
}

export const addBoundsToWorld = (world, { width, height }) => {
  const worldBoundarySize = 32
  const worldBoundaryProps = {
    mass: Infinity,
    // strokeStyle: undefined,
    rigid: true,
    restitution: 0,
  }
  const left = createRectangle({
    name: "world-boundary-left",
    centerX: -worldBoundarySize / 2,
    centerY: height / 2,
    width: worldBoundarySize,
    height,
    ...worldBoundaryProps,
  })
  world.addGameObject(left)
  const top = createRectangle({
    name: "world-boundary-top",
    centerX: width / 2,
    centerY: -worldBoundarySize / 2,
    width: width + worldBoundarySize * 2,
    height: worldBoundarySize,
    ...worldBoundaryProps,
  })
  world.addGameObject(top)
  const right = createRectangle({
    name: "world-boundary-right",
    centerX: width + worldBoundarySize / 2,
    centerY: height / 2,
    width: worldBoundarySize,
    height,
    ...worldBoundaryProps,
  })
  world.addGameObject(right)
  const bottom = createRectangle({
    name: "world-boundary-bottom",
    centerX: width / 2,
    centerY: height + worldBoundarySize / 2,
    width: width + worldBoundarySize * 2,
    height: worldBoundarySize,
    ...worldBoundaryProps,
  })
  world.addGameObject(bottom)
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
