import { handleMotion, motionAllowedFromMass } from "./physic.motion.js"
import { handleCollision } from "./physic.collision.js"

// maybe rename time into gameTime ?
// put sleepEnabled sur rigid body (pouvoir le controller par rigidBody)

export const updatePhysicForArcadeGame = ({
  gameObjects,
  timePerFrame,
  time,
  motion = true,
  // beware it's move before collision resolution
  // so not really useful, ideally callback should be called after collision resolution
  moveCallback = () => {},

  collisionCallback = () => {},
  collisionPositionResolution = true,
  collisionVelocityImpact = true,
  // pour sleeping qui se comporte un peu mieux
  // if an object is resting on the floor and the object
  // does not move beyond a minimal distance in about two seconds,
  // then the physics calculations are disabled
  // -> https://en.wikipedia.org/wiki/Physics_engine
  // https://gamedev.stackexchange.com/questions/114925/in-a-2d-physics-engine-how-do-i-avoid-useless-collision-resolutions-when-object
  sleepEnabled = true,
  // when move (x+y+angle) is less than sleepMoveThreshold
  // we consider object as static/motionless
  // when this happen for more than sleepStartSeconds
  // object is put to sleep
  sleepMoveThreshold = 0.1,
  sleepVelocityThreshold = 0.1,
  sleepStartDuration = 2,

  // pour bounce threshold
  // this is the right keywords for the bounce issue: "rigid body bounce ground"
  // https://forum.unity.com/threads/bouncy-character-when-landed-on-ground.408821/
  // c'est surement une solution aussi: bounceThreshold
  // https://github.com/MassiveHeights/Black/blob/e4967f19cbdfe42b3612981c810ac499ad34b154/src/physics/arcade/pairs/Pair.js#L51
  // bounceThreshold = 1,
}) => {
  if (motion) {
    handleMotion({
      gameObjects,
      timePerFrame,
      moveCallback,
    })
  }
  handleCollision({
    gameObjects,
    collisionCallback,
    collisionPositionResolution,
    collisionVelocityImpact,
  })

  if (sleepEnabled) {
    handleSleep({
      gameObjects,
      sleepMoveThreshold,
      sleepVelocityThreshold,
      sleepStartDuration,
      time,
    })
  }
}

const handleSleep = ({
  gameObjects,
  sleepMoveThreshold,
  sleepVelocityThreshold,
  sleepStartDuration,
  time,
}) => {
  gameObjects.forEach((gameObject) => {
    const { centerX, centerY, angle } = gameObject
    const { centerXPrev, centerYPrev, anglePrev } = gameObject
    // now we know the move for this object, store current position
    // for the next iteration
    gameObject.centerXPrev = centerX
    gameObject.centerYPrev = centerY
    gameObject.anglePrev = angle

    // this object is new, give up on detecting if it should sleep
    if (centerXPrev === undefined) {
      return
    }

    const moveX = centerX - centerXPrev
    const moveY = centerY - centerYPrev
    const moveAngle = angle - anglePrev
    updateSleepingState(gameObject, {
      moveX,
      moveY,
      moveAngle,
      sleepMoveThreshold,
      sleepVelocityThreshold,
      sleepStartDuration,
      time,
    })
  })
}

const updateSleepingState = (
  gameObject,
  { moveX, moveY, moveAngle, sleepMoveThreshold, sleepVelocityThreshold, sleepStartDuration, time },
) => {
  if (!gameObject.rigid) {
    return
  }

  if (!motionAllowedFromMass(gameObject.mass)) {
    return
  }

  const move = quantifyMove(gameObject, { moveX, moveY, moveAngle })
  const moveBelowSleepThreshold = move < sleepMoveThreshold

  // this object is moving enough to be considered awake
  if (!moveBelowSleepThreshold) {
    gameObject.lastNotableMoveTime = time
    gameObject.sleeping = false
    return
  }

  if (gameObject.sleeping) {
    // this object is certainly about to move because velocity
    // is high enough, ensure it is awake
    const velocity = quantifyVelocity(gameObject)
    const velocityBelowSleepThreshold = velocity < sleepVelocityThreshold
    if (!velocityBelowSleepThreshold) {
      gameObject.sleeping = false
      return
    }

    const { forceX, forceY, forceAngle } = gameObject
    const force = forceX * forceX + forceY * forceY + forceAngle * forceAngle
    if (force > 0.1) {
      gameObject.sleeping = false
      return
    }
  }

  // not moving enough
  if (gameObject.sleeping) {
    // already sleeping
    return
  }

  // should we put object to sleep ?
  const lastNotableMoveTime = gameObject.lastNotableMoveTime
  const timeSinceLastNotableMove = time - lastNotableMoveTime
  if (timeSinceLastNotableMove < sleepStartDuration) {
    return
  }

  // put object to sleep
  // we also reset velocity to ensure it won't try to move again (due to gravity)
  // because in the last sleepStartDuration it had negligible impact
  // on its position, its unlikely to ever change
  gameObject.sleeping = true
  gameObject.velocityX = 0
  gameObject.velocityY = 0
  gameObject.velocityAngle = 0
}

const quantifyMove = (gameObject, { moveX, moveY, moveAngle }) => {
  let total = 0

  const moveFromXAndY = Math.sqrt(moveX * moveX + moveY * moveY)
  total += moveFromXAndY

  if (moveAngle) {
    if (gameObject.shape === "circle") {
      // nothing todo: rotating a circle does not impact its position
    }
    if (gameObject.shape === "rectangle") {
      // not a super approximation, we should take into acount the dimension
      const moveFromAngle = moveAngle * moveAngle
      total += moveFromAngle
    }
  }

  return total
}

const quantifyVelocity = ({ shape, velocityX, velocityY, velocityAngle }) => {
  let total = 0

  const velocityFromXAndY = velocityX * velocityX + velocityY * velocityY
  total += velocityFromXAndY

  if (velocityAngle) {
    if (shape === "circle") {
      // nothing todo: rotating a circle does not impact its position
    }
    if (shape === "rectangle") {
      const velocityFromAngle = velocityAngle * velocityAngle
      total += velocityFromAngle
    }
  }

  return total
}
