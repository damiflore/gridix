import { motionAllowedFromMass } from "./physic.motion.js"

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

  const moveIsNotable = !getMoveIsNegligible({
    moveX,
    moveY,
    moveAngle,
    sleepMoveThreshold,
  })

  if (gameObject.sleeping) {
    if (
      moveIsNotable ||
      shouldAwake(gameObject, {
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

  // it's moving enough
  if (moveIsNotable) {
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
    forceXWhenSleepStarted: gameObject.forceX,
    forceYWhenSleepStarted: gameObject.forceY,
    forceAngleWhenSleepStarted: gameObject.forceAngle,
    velocityXWhenSleepStarted: gameObject.velocityX,
    velocityYWhenSleepStarted: gameObject.velocityY,
    velocityAngleWhenSleepStarted: gameObject.velocityAngle,
  })
}

const getMoveIsNegligible = ({ moveX, moveY, moveAngle, sleepMoveThreshold }) => {
  if (Math.abs(moveX) > sleepMoveThreshold) {
    return false
  }

  if (Math.abs(moveY) > sleepMoveThreshold) {
    return false
  }

  if (Math.abs(moveAngle) > sleepMoveThreshold) {
    return false
  }

  return true
}

const shouldAwake = (gameObject, { sleepVelocityThreshold, sleepForceThreshold }) => {
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

  const { forceX, forceXWhenSleepStarted } = gameObject
  const forceXSinceSleeping = Math.abs(forceXWhenSleepStarted - forceX)
  if (forceXSinceSleeping > sleepForceThreshold) {
    // this object force x increased enough for some reason
    // -> awake it
    return true
  }

  const { forceY, forceYWhenSleepStarted } = gameObject
  const forceYSinceSleeping = Math.abs(forceYWhenSleepStarted - forceY)
  if (forceYSinceSleeping > sleepForceThreshold) {
    // this object force y increased enough for some reason
    // -> awake it
    return true
  }

  const { forceAngle, forceAngleWhenSleepStarted } = gameObject
  const forceAngleSinceSleeping = Math.abs(forceAngleWhenSleepStarted - forceAngle)
  if (forceAngleSinceSleeping > sleepForceThreshold) {
    // this object force angle increased enough for some reason
    return true
  }

  return false
}
