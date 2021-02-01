import { motionAllowedFromMass, getTotalForces } from "./physic.motion.js"

export const handleSleep = ({
  world,
  stepInfo,
  sleepMoveThreshold,
  sleepForceThreshold,
  sleepVelocityThreshold,
  sleepStartDuration,
  moveCallback,
}) => {
  // je pense on veut une premiere chose qui est de track qui bouge
  // avec prev/next
  // et un deuxieme qui est de stocker une valeur lorsqu'il s'est endormi
  // sauf que sleep réutilise le concept de prev/next sur la position

  world.forEachGameObject((gameObject) => {
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
      stepInfo,
      moveX,
      moveY,
      moveAngle,
      sleepMoveThreshold,
      sleepForceThreshold,
      sleepVelocityThreshold,
      sleepStartDuration,
      moveCallback,
    })
  })
}

const updateSleepingState = (
  gameObject,
  {
    stepInfo,
    moveX,
    moveY,
    moveAngle,
    sleepMoveThreshold,
    sleepForceThreshold,
    sleepVelocityThreshold,
    sleepStartDuration,
    moveCallback,
  },
) => {
  if (!gameObject.rigid) {
    return
  }

  if (!motionAllowedFromMass(gameObject.mass)) {
    return
  }

  if (gameObject.debugSleep) {
    gameObject.debugSleep = false
    // eslint-disable-next-line no-debugger
    debugger
  }

  if (gameObject.sleeping) {
    if (
      shouldAwake(gameObject, {
        sleepMoveThreshold,
        sleepForceThreshold,
        sleepVelocityThreshold,
      })
    ) {
      gameObject.lastNotableMotionTime = stepInfo.time
      gameObject.sleeping = false
      moveCallback(gameObject)
    }
    return
  }

  const move = quantifyMove(gameObject, { moveX, moveY, moveAngle })
  // it's moving enough
  if (move > sleepMoveThreshold) {
    gameObject.lastNotableMotionTime = stepInfo.time
    moveCallback(gameObject)
    return
  }

  // not moving enough, since how long?
  const lastNotableMotionTime = gameObject.lastNotableMotionTime
  const timeSinceLastNotableMotion = stepInfo.time - lastNotableMotionTime
  if (timeSinceLastNotableMotion < sleepStartDuration) {
    // not since enough time
    return
  }

  // at this point object is not noving enough since at least sleepStartDuration
  // -> put object to sleep
  Object.assign(gameObject, {
    sleeping: true,
    forceXWhenSleepStarted: 0,
    forceYWhenSleepStarted: 0,
    forceAngleWhenSleepStarted: 0,
    velocityXWhenSleepStarted: gameObject.velocityX,
    velocityYWhenSleepStarted: gameObject.velocityY,
    velocityAngleWhenSleepStarted: gameObject.velocityAngle,
  })
}

const shouldAwake = (
  gameObject,
  { moveX, moveY, moveAngle, sleepMoveThreshold, sleepVelocityThreshold, sleepForceThreshold },
) => {
  const move = quantifyMove(gameObject, { moveX, moveY, moveAngle })
  if (move > sleepMoveThreshold) {
    return true
  }

  const { velocityX, velocityXWhenSleepStarted } = gameObject
  const velocityXSinceSleeping = Math.abs(velocityXWhenSleepStarted - velocityX)
  if (velocityXSinceSleeping > sleepVelocityThreshold) {
    // this object velocityX increased enough for some reason
    return true
  }

  const { velocityY, velocityYWhenSleepStarted } = gameObject
  const velocityYSinceSleeping = Math.abs(velocityYWhenSleepStarted - velocityY)
  if (velocityYSinceSleeping > sleepVelocityThreshold) {
    // this object velocityY increased enough for some reason
    return true
  }

  const { velocityAngle, velocityAngleWhenSleepStarted } = gameObject
  const velocityAngleSinceSleeping = Math.abs(velocityAngleWhenSleepStarted - velocityAngle)
  if (velocityAngleSinceSleeping > sleepVelocityThreshold) {
    // this object velocityAngle increased enough for some reason
    // -> awake it
    return true
  }

  const forceTotal = getTotalForces(gameObject.forces)
  const { forceXWhenSleepStarted } = gameObject
  const forceXSinceSleeping = Math.abs(forceXWhenSleepStarted - forceTotal.x)
  if (forceXSinceSleeping > sleepForceThreshold) {
    // this object force x increased enough for some reason
    // -> awake it
    return true
  }

  const { forceYWhenSleepStarted } = gameObject
  const forceYSinceSleeping = Math.abs(forceYWhenSleepStarted - forceTotal.y)
  if (forceYSinceSleeping > sleepForceThreshold) {
    // this object force y increased enough for some reason
    // -> awake it
    return true
  }

  const { forceAngleWhenSleepStarted } = gameObject
  const forceAngleSinceSleeping = Math.abs(forceAngleWhenSleepStarted - forceTotal.angle)
  if (forceAngleSinceSleeping > sleepForceThreshold) {
    // this object force angle increased enough for some reason
    return true
  }

  return false
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
