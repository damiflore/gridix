import { pointHitCircle } from "../collision/pointHitCircle.js"
import { pointHitRectangle } from "../collision/pointHitRectangle.js"
import { getCollisionInfo } from "../collision/collisionInfo.js"
import { getIntersectionRatioBetweenRectangles } from "../geometry/rectangle.js"
import { updatePhysicForArcadeGame } from "../physic/physic.js"
import { drawCollisionInfo } from "../draw/draw.js"
import { createRectangle } from "./shape.js"

export const createWorld = ({ width, height }) => {
  const gameObjects = []
  const collisionInfos = []
  const world = { width, height }

  // layers:
  // aboveGrid
  // middleGrid
  // belowGrid

  const deriveStateFromPosition = (gameObject) => {
    let gameObjectWithFrictionAndHighestIntersectionRatio = null
    const highestIntersectionRatio = 0
    gameObjects.forEach((gameObjectCandidate) => {
      if (gameObjectCandidate === gameObject) {
        return
      }
      if (!gameObject.hitbox) {
        return
      }
      if (!gameObjectCandidate.hitbox) {
        return
      }
      const { frictionGround } = gameObjectCandidate
      if (frictionGround === undefined) {
        return
      }
      const collisionInfo = getCollisionInfo(gameObject, gameObjectCandidate)

      if (!collisionInfo) {
        return
      }

      // ideally we would choose the ground with highest intersection ratio
      // with gameObject
      const intersectionRatio = getIntersectionRatioBetweenRectangles(
        gameObject,
        gameObjectCandidate,
      )
      if (intersectionRatio > highestIntersectionRatio) {
        gameObjectWithFrictionAndHighestIntersectionRatio = gameObjectCandidate
      }
    })

    // the only "drawback" is the if hero stands on the ground
    // but ground has no frictionGround set, then the first object with a frictionGround
    // will be applied. It can be fixed by ensuring all ground objects
    // got a frictionGround set
    const frictionAmbient = gameObjectWithFrictionAndHighestIntersectionRatio
      ? gameObjectWithFrictionAndHighestIntersectionRatio.frictionGround
      : 0.2

    return {
      frictionAmbient,
    }
  }

  const updateGameObjectStateFromPosition = (gameObject) => {
    const stateFromPosition = deriveStateFromPosition(gameObject)
    if (stateFromPosition) {
      Object.assign(gameObject, stateFromPosition)
    }
  }

  const update = (stepInfo) => {
    world.forEachGameObject((gameObject) => {
      const { update } = gameObject
      if (update) {
        update(gameObject, stepInfo)
      }
    })

    // faire un truc qui implémente le concept de area
    // lorsqu'un objet a une hitbox + un areaEffect on apelle cela sur tous les objets
    // dans la zone d'effet
    // lorsqu'un objet quitte la zone on apelle la fonction cleanup

    collisionInfos.length = 0
    updatePhysicForArcadeGame({
      world,
      stepInfo,
      collisionCallback: ({ collisionInfo }) => {
        collisionInfos.push(collisionInfo)
      },
      moveCallback: (gameObject) => {
        updateGameObjectStateFromPosition(gameObject)
      },
      collisionPositionResolution: true,
      collisionVelocityImpact: true,
    })
  }

  const draw = (stepInfo, context) => {
    collisionInfos.forEach((collisionInfo) => {
      drawCollisionInfo(collisionInfo, context)
    })
  }

  const addGameObject = (gameObject) => {
    updateGameObjectStateFromPosition(gameObject)
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
  })

  return world
}

export const addBoundsToWorld = (world, { worldBoundarySize = 32 } = {}) => {
  const { width, height } = world

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
