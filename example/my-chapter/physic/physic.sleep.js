import { motionAllowedFromMass } from "./physic.motion.js"

export const handleSleep = ({
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

    // const { forceX, forceY, forceAngle } = gameObject
    // const force = forceX * forceX + forceY * forceY + forceAngle * forceAngle
    // if (forc) {
    //   gameObject.sleeping = false
    //   return
    // }
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
