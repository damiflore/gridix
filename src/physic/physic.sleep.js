import { motionAllowedFromMass } from "./physic.motion.js"

export const handleSleep = ({
  rigidBodies,
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

  rigidBodies.forEach((rigidBody) => {
    const { centerX, centerY, angle } = rigidBody
    const { centerXPrev, centerYPrev, anglePrev } = rigidBody
    // now we know the move for this object, store current position
    // for the next iteration
    rigidBody.centerXPrev = centerX
    rigidBody.centerYPrev = centerY
    rigidBody.anglePrev = angle

    // this object is new, give up on detecting if it should sleep
    if (centerXPrev === undefined) {
      return
    }

    const move = {
      from: { x: centerXPrev, y: centerYPrev, angle: anglePrev },
      to: { x: centerX, y: centerY, angle },
      x: centerX - centerXPrev,
      y: centerY - centerYPrev,
      angle: angle - anglePrev,
    }

    updateSleepingState(rigidBody, {
      stepInfo,
      move,
      sleepMoveThreshold,
      sleepForceThreshold,
      sleepVelocityThreshold,
      sleepStartDuration,
      moveCallback,
    })
  })
}

const updateSleepingState = (
  rigidBody,
  {
    stepInfo,
    move,
    sleepMoveThreshold,
    sleepForceThreshold,
    sleepVelocityThreshold,
    sleepStartDuration,
    moveCallback,
  },
) => {
  if (!motionAllowedFromMass(rigidBody.mass)) {
    return
  }

  if (rigidBody.debugSleep) {
    rigidBody.debugSleep = false
    // eslint-disable-next-line no-debugger
    debugger
  }

  const moveIsNotable = !getMoveIsNegligible({
    move,
    sleepMoveThreshold,
  })

  if (rigidBody.sleeping) {
    if (
      moveIsNotable ||
      shouldAwake(rigidBody, {
        sleepForceThreshold,
        sleepVelocityThreshold,
      })
    ) {
      rigidBody.lastNotableMotionTime = stepInfo.time
      rigidBody.sleeping = false
      moveCallback(rigidBody, move)
    }
    return
  }

  // it's moving enough
  if (moveIsNotable) {
    rigidBody.lastNotableMotionTime = stepInfo.time
    moveCallback(rigidBody, move)
    return
  }

  // not moving enough, since how long?
  const lastNotableMotionTime = rigidBody.lastNotableMotionTime
  const timeSinceLastNotableMotion = stepInfo.time - lastNotableMotionTime
  if (timeSinceLastNotableMotion < sleepStartDuration) {
    // not since enough time
    return
  }

  // at this point object is not noving enough since at least sleepStartDuration
  // -> put object to sleep
  Object.assign(rigidBody, {
    sleeping: true,
    forceXWhenSleepStarted: rigidBody.forceX,
    forceYWhenSleepStarted: rigidBody.forceY,
    forceAngleWhenSleepStarted: rigidBody.forceAngle,
    velocityXWhenSleepStarted: rigidBody.velocityX,
    velocityYWhenSleepStarted: rigidBody.velocityY,
    velocityAngleWhenSleepStarted: rigidBody.velocityAngle,
  })
}

const getMoveIsNegligible = ({ move, sleepMoveThreshold }) => {
  if (Math.abs(move.x) > sleepMoveThreshold) {
    return false
  }

  if (Math.abs(move.y) > sleepMoveThreshold) {
    return false
  }

  if (Math.abs(move.angle) > sleepMoveThreshold) {
    return false
  }

  return true
}

const shouldAwake = (rigidBody, { sleepVelocityThreshold, sleepForceThreshold }) => {
  const { velocityX, velocityXWhenSleepStarted } = rigidBody
  const velocityXSinceSleeping = Math.abs(velocityXWhenSleepStarted - velocityX)
  if (velocityXSinceSleeping > sleepVelocityThreshold) {
    // this object velocityX increased enough for some reason
    return true
  }

  const { velocityY, velocityYWhenSleepStarted } = rigidBody
  const velocityYSinceSleeping = Math.abs(velocityYWhenSleepStarted - velocityY)
  if (velocityYSinceSleeping > sleepVelocityThreshold) {
    // this object velocityY increased enough for some reason
    return true
  }

  const { velocityAngle, velocityAngleWhenSleepStarted } = rigidBody
  const velocityAngleSinceSleeping = Math.abs(velocityAngleWhenSleepStarted - velocityAngle)
  if (velocityAngleSinceSleeping > sleepVelocityThreshold) {
    // this object velocityAngle increased enough for some reason
    // -> awake it
    return true
  }

  const { forceX, forceXWhenSleepStarted } = rigidBody
  const forceXSinceSleeping = Math.abs(forceXWhenSleepStarted - forceX)
  if (forceXSinceSleeping > sleepForceThreshold) {
    // this object force x increased enough for some reason
    // -> awake it
    return true
  }

  const { forceY, forceYWhenSleepStarted } = rigidBody
  const forceYSinceSleeping = Math.abs(forceYWhenSleepStarted - forceY)
  if (forceYSinceSleeping > sleepForceThreshold) {
    // this object force y increased enough for some reason
    // -> awake it
    return true
  }

  const { forceAngle, forceAngleWhenSleepStarted } = rigidBody
  const forceAngleSinceSleeping = Math.abs(forceAngleWhenSleepStarted - forceAngle)
  if (forceAngleSinceSleeping > sleepForceThreshold) {
    // this object force angle increased enough for some reason
    return true
  }

  return false
}
