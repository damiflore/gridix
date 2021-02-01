/* eslint-disable no-nested-ternary */
import { trackKeyboardKeydown } from "../../src/interaction/keyboard.js"
import { createRectangle } from "./world/shape.js"
import { createWorld, addBoundsToWorld } from "./world/world.js"
import { closestCellCenterFromPoint, centerXFromCellX, centerYFromCellY } from "./geometry/grid.js"
import { getCollisionInfo } from "./collision/collisionInfo.js"
import { getIntersectionRatioBetweenRectangles } from "./geometry/rectangle.js"
import { clampMagnitude, sameSign } from "./math/math.js"
// import { getDistanceBetweenVectors } from "./geometry/vector.js"

export const demoBloc = () => {
  const worldGrid = {
    cellXCount: 10,
    cellYCount: 10,
    cellSize: 32,
  }
  const world = createWorld({
    width: worldGrid.cellXCount * worldGrid.cellSize,
    height: worldGrid.cellYCount * worldGrid.cellSize,
    onGameObjectMove: (gameObject) => {
      updateGameObjectStateFromPosition(gameObject, world)
    },
  })

  addBoundsToWorld(world)

  let hero

  const { cellSize } = worldGrid

  // put keyboard first so that sidewalk will be able to add/substract force from keyboard impulse
  const downKey = trackKeyboardKeydown({
    code: "ArrowDown",
    node: document,
  })
  const upKey = trackKeyboardKeydown({
    code: "ArrowUp",
    node: document,
  })
  const leftKey = trackKeyboardKeydown({
    code: "ArrowLeft",
    node: document,
  })
  const rightKey = trackKeyboardKeydown({
    code: "ArrowRight",
    node: document,
  })
  const keyboardVelocity = 200
  // the accell/decel numbers below are dependent of the ambient friction
  // idéalement la vitesse du hero dans une direction devrait
  // rendre plus difficile de repartir dans une autre direction ?
  const maxAccel = 25000
  const maxDecel = 5000
  world.addGameObject({
    name: "keyboard-navigation",
    update: (_, { timePerFrame }) => {
      // https://docs.unity3d.com/ScriptReference/Rigidbody2D.AddForce.html
      // https://gamedev.stackexchange.com/a/169844

      let forceX = 0
      const keyXCoef = keyToCoef(leftKey, rightKey)
      if (keyXCoef) {
        const { velocityX } = hero
        const velocityCurrent = velocityX
        const velocityDesired = keyboardVelocity * keyXCoef
        const velocityDiff = velocityDesired - velocityCurrent
        const max = sameSign(velocityCurrent, keyXCoef) ? maxAccel : maxDecel
        const acceleration = clampMagnitude(velocityDiff / timePerFrame, max * hero.frictionAmbient)
        forceX = hero.mass * acceleration
      }

      let forceY = 0
      const keyYCoef = keyToCoef(upKey, downKey)
      if (keyYCoef) {
        const { velocityY } = hero
        const velocityCurrent = velocityY
        const velocityDesired = keyboardVelocity * keyYCoef
        const velocityDiff = velocityDesired - velocityCurrent
        const max = sameSign(velocityCurrent, keyYCoef) ? maxAccel : maxDecel
        const acceleration = clampMagnitude(velocityDiff / timePerFrame, max * hero.frictionAmbient)
        forceY = hero.mass * acceleration
      }

      if (forceX || forceY) {
        hero.forces.push({ x: forceX, y: forceY })
      }
    },
  })

  const addWall = ({ cellX, cellY }) => {
    const wall = createRectangle({
      centerX: centerXFromCellX(cellX, worldGrid),
      centerY: centerYFromCellY(cellY, worldGrid),
      angleLocked: true,
      width: cellSize,
      height: cellSize,
      mass: Infinity,
      rigid: true,
      fillStyle: "black",
      friction: 0.2,
    })
    world.addGameObject(wall)
  }

  const addBaril = ({ cellX, cellY }) => {
    const baril = createRectangle({
      name: "baril",
      centerX: centerXFromCellX(cellX, worldGrid),
      centerY: centerYFromCellY(cellY, worldGrid),
      // TODO: use force instead of velocity
      update: (baril) => {
        // the goal here is to facilitate a moving baril to stop
        // exactly on a cell.
        // sleeping baril -> do nothing
        // baril moving too fast -> do nothing
        // baril moving the opposite direction of closest cell -> do nothing
        // baril already "exactly" on the cell -> do nothing

        const { sleeping } = baril
        if (sleeping) {
          return
        }

        const { velocityX, velocityY } = baril
        // too fast
        const velocityXStrength = Math.abs(velocityX)
        if (velocityXStrength > 10) {
          return
        }
        const velocityYStrength = Math.abs(velocityY)
        if (velocityYStrength > 10) {
          return
        }

        const force = 50
        const { centerX, centerY } = baril
        const closestCellCenter = closestCellCenterFromPoint(
          { x: centerX, y: centerY },
          { cellSize },
        )
        const cellCenterToCenterXDiff = closestCellCenter.x - centerX

        if (velocityXStrength > velocityYStrength) {
          // no velocity, don't awake
          if (velocityX === 0) {
            return
          }
          // velocity going the other way
          if (!sameSign(cellCenterToCenterXDiff, velocityX)) {
            return
          }
          // no worthy adjustement on X required
          if (Math.abs(cellCenterToCenterXDiff) < 0.1) {
            return
          }

          baril.forces.push({ x: baril.mass * force * cellCenterToCenterXDiff })
          return
        }

        const cellCenterToCenterYDiff = closestCellCenter.y - centerY
        if (velocityY === 0) {
          return
        }
        if (!sameSign(cellCenterToCenterYDiff, velocityY)) {
          return
        }
        // no worthy adjustement on Y required
        if (Math.abs(cellCenterToCenterYDiff) < 0.1) {
          return
        }

        baril.forces.push({ y: baril.mass * force * cellCenterToCenterYDiff })
      },
      angleLocked: true,
      sleeping: true,
      width: cellSize,
      height: cellSize,
      mass: 1,
      rigid: true,
      fillStyle: "brown",
      friction: 0.2,
      frictionAmbient: 0.7,
    })
    world.addGameObject(baril)
  }

  const addIce = ({ cellX, cellY }) => {
    // something enters the ice area -> frictionAmbient goes super low
    const ice = createRectangle({
      name: "ice",
      // rigid: true,
      hitbox: true,
      frictionGround: 0.05,
      centerX: centerXFromCellX(cellX, worldGrid),
      centerY: centerYFromCellY(cellY, worldGrid),
      width: cellSize,
      height: cellSize,
      fillStyle: "lightblue",
    })
    world.addGameObject(ice)
  }

  const addSideWalkTop = ({ cellX, cellY }) => {
    const sidewalk = createRectangle({
      name: "sidewalk-top",
      // rigid: true,
      hitbox: true,
      areaEffect: (sidewalk, gameObject) => {
        const sidewalkForce = { origin: sidewalk, y: -600 }
        gameObject.forces.push(sidewalkForce)
        return () => {}
      },
      centerX: centerXFromCellX(cellX, worldGrid),
      centerY: centerYFromCellY(cellY, worldGrid),
      width: cellSize,
      height: cellSize,
      fillStyle: "lightgreen",
    })
    world.addGameObject(sidewalk)
  }

  const addHero = ({ cellX, cellY }) => {
    const hero = createRectangle({
      name: "hero",
      centerX: centerXFromCellX(cellX, worldGrid),
      centerY: centerYFromCellY(cellY, worldGrid),
      angleLocked: true,
      width: 32,
      height: 32,
      fillStyle: "red",
      rigid: true,
      friction: 0.01,
      frictionAmbient: 0.2,
    })
    world.addGameObject(hero)
    return hero
  }

  // const addSpeedwalkRight = () => {}

  addSideWalkTop({ cellX: 5, cellY: 1 })
  addSideWalkTop({ cellX: 5, cellY: 2 })
  addSideWalkTop({ cellX: 5, cellY: 3 })

  addWall({ cellX: 1, cellY: 0 })
  addWall({ cellX: 1, cellY: 1 })
  addBaril({ cellX: 1, cellY: 2 })
  addBaril({ cellX: 2, cellY: 2 })
  addBaril({ cellX: 5, cellY: 3 })
  addWall({ cellX: 1, cellY: 3 })

  // addIce({ cellX: 0, cellY: 0 })
  addIce({ cellX: 3, cellY: 7 })
  addIce({ cellX: 4, cellY: 7 })
  addIce({ cellX: 5, cellY: 7 })
  addIce({ cellX: 3, cellY: 8 })
  addIce({ cellX: 4, cellY: 8 })
  addIce({ cellX: 5, cellY: 8 })
  addIce({ cellX: 6, cellY: 7 })
  addIce({ cellX: 6, cellY: 8 })

  hero = addHero({ cellX: 0, cellY: 0 })

  return world
}

const updateGameObjectStateFromPosition = (gameObject, world) => {
  let gameObjectWithFrictionAndHighestIntersectionRatio = null
  const highestIntersectionRatio = 0
  world.forEachGameObject((gameObjectCandidate) => {
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
    const intersectionRatio = getIntersectionRatioBetweenRectangles(gameObject, gameObjectCandidate)
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

  gameObject.frictionAmbient = frictionAmbient
}

const keyToCoef = (firstKey, secondKey) => {
  if (firstKey.isDown && secondKey.isDown) {
    if (firstKey.downTimeStamp > secondKey.downTimeStamp) {
      return -1
    }

    return 1
  }

  if (firstKey.isDown) {
    return -1
  }

  if (secondKey.isDown) {
    return 1
  }

  return 0
}
