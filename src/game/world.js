import { pointHitCircle } from "src/collision/pointHitCircle.js"
import { pointHitRectangle } from "src/collision/pointHitRectangle.js"
import { createSimulation } from "src/physic/physic.simulation.js"
import { drawCollisionInfo } from "src/draw/draw.js"
import { injectStylesheetIntoDocument } from "src/helper/dom.js"

const worldCssUrl = new URL("./world.css", import.meta.url)

export const createWorld = ({
  devtools = true,
  container,
  worldWidth = 0,
  worldHeight = 0,
  onGameObjectAdded = () => {},
  onGameObjectMoved = () => {},
  onGameObjectRemoved = () => {},
}) => {
  injectStylesheetIntoDocument(worldCssUrl)

  const gameObjects = []
  const collisionInfos = []
  const world = { worldWidth, worldHeight }

  const worldNode = document.createElement("div")
  worldNode.className = "world"
  container.appendChild(worldNode)

  const worldViewNode = document.createElement("div")
  worldViewNode.className = "world-view"
  worldNode.appendChild(worldViewNode)

  const worldViewWrapper = document.createElement("div")
  worldViewWrapper.className = "world-view-wrapper"

  worldViewWrapper.style.width = `${world.worldWidth}px`
  worldViewWrapper.style.height = `${world.worldHeight}px`
  worldViewNode.appendChild(worldViewWrapper)

  const canvas = document.createElement("canvas")
  canvas.width = world.worldWidth
  canvas.height = world.worldHeight
  worldViewWrapper.appendChild(canvas)

  if (devtools) {
    loadAndInjectDevtools({ world, worldNode })
  }
  world.devtools = {
    opened: false,
  }

  const context = canvas.getContext("2d")

  const physicSimulation = createSimulation({
    collisionCallback: ({ collisionInfo }) => {
      collisionInfos.push(collisionInfo)
    },
    onRigidBodyMoved: onGameObjectMoved,
    collisionPositionResolution: true,
    collisionVelocityImpact: true,
  })

  const update = (stepInfo) => {
    gameObjects.forEach((gameObject) => {
      const { update } = gameObject
      if (!update) {
        return
      }
      update(gameObject, stepInfo)
    })
    collisionInfos.length = 0
    physicSimulation.step(stepInfo)
  }

  const draw = () => {
    collisionInfos.forEach((collisionInfo) => {
      drawCollisionInfo(collisionInfo, context)
    })

    context.clearRect(0, 0, world.worldWidth, world.worldHeight)
    gameObjects.forEach((gameObject) => {
      const { draw } = gameObject
      if (!draw) {
        return
      }

      // if (gameObject === gameObjectSelected) {
      //   gameObject.strokeStyle = "orange"
      //   gameObject.lineWidth = 4
      // } else {
      gameObject.strokeStyle = "blue"
      gameObject.lineWidth = 1
      // }
      gameObject.alpha = gameObject.sleeping ? 0.5 : 1

      gameObject.draw(gameObject, context)
    })
  }

  const addGameObject = (gameObject) => {
    gameObjects.push(gameObject)
    if (gameObject.rigid) {
      physicSimulation.addRigidBody(gameObject)
    }
    onGameObjectAdded(gameObject)
  }

  const countGameObjects = () => {
    return gameObjects.length
  }

  const removeGameObject = (gameObject) => {
    const index = gameObjects.indexOf(gameObject)
    if (index > -1) {
      physicSimulation.removeRigidBody(gameObject)
      gameObjects.splice(index, 1)
      onGameObjectRemoved(gameObject)
    }
  }

  const forEachGameObject = (fn) => {
    gameObjects.forEach(fn)
  }

  const gameObjectFromPoint = (point) => {
    const gameObjectsAtPoint = gameObjectsFromPoint(point)
    // ideally get the once with highest z-index
    return gameObjectsAtPoint[gameObjectsAtPoint.length - 1]
  }

  const gameObjectsFromPoint = (point) => {
    return gameObjects.filter((gameObject) => pointHitGameObject(point, gameObject))
  }

  const getGameObjects = () => gameObjects

  Object.assign(world, {
    update,
    draw,
    getGameObjects,
    addGameObject,
    countGameObjects,
    forEachGameObject,
    removeGameObject,
    gameObjectFromPoint,
    gameObjectsFromPoint,

    simulation: physicSimulation,
  })

  return world
}

const loadAndInjectDevtools = async (params) => {
  const { injectDevtools } = await import("src/devtools/devtools.inject.js")
  injectDevtools(params)
}

const pointHitGameObject = (point, gameObject) => {
  const { shapeName } = gameObject

  if (shapeName === "circle") {
    return pointHitCircle(point, gameObject)
  }

  if (shapeName === "rectangle") {
    return pointHitRectangle(point, gameObject)
  }

  return false
}
