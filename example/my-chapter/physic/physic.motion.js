/* eslint-disable operator-assignment */
// import { PHYSIC_CONSTANTS } from "./physic.constants.js"
// import { limitNumberPrecision } from "../math/limitNumberPrecision.js"

// const limitVelocityPrecision = limitNumberPrecision(4)

export const handleMotion = ({ world, stepInfo }) => {
  const { timePerFrame } = stepInfo
  const positionUpdates = []
  world.forEachGameObject((gameObject) => {
    if (!gameObject.rigid) {
      return
    }

    const velocityX = gameObject.velocityX
    const velocityY = gameObject.velocityY
    const velocityAngle = gameObject.velocityAngle
    const { forces } = gameObject
    const motionAllowedByMass = motionAllowedFromMass(gameObject.mass)
    if (!motionAllowedByMass) {
      if (forces.length > 0) {
        if (import.meta.dev) {
          warnForcesIgnored(gameObject)
        }
        forces.length = 0
      }
      if (velocityX || velocityY || velocityAngle) {
        if (import.meta.dev) {
          warnVelocityIgnored(gameObject)
        }
        gameObject.velocityX = gameObject.velocityY = gameObject.velocityAngle = 0
      }
      return
    }

    if (gameObject.sleeping) {
      return
    }

    // normalement c'est mass et acceleration la force, la je fait rien de tout ça
    // et aussi, l'application d'une force par le clavier
    // semble augmener la vélocité non stop (ah bah oui c'est normal en fait)
    // donc le clavier ne doit appliquer une force que pour obtenir
    // une vélocité particuliere?
    const forceTotal = getTotalForces(forces)
    // forces are punctual by default
    // if there is a constant force dragging object to the bottom (gravity)
    // it must be reapplied every update
    // this can be implement doing PHYSIC_CONSTANTS.forceYAmbient = 20
    forces.length = 0

    const accelerationX = forceTotal.x / gameObject.mass
    const accelerationY = forceTotal.y / gameObject.mass
    const accelerationAngle = forceTotal.angle / gameObject.mass

    const frictionAmbientCoef = 1 - gameObject.frictionAmbient
    const velocityXAfterApplicationOfForces =
      (velocityX + accelerationX * timePerFrame) * frictionAmbientCoef
    const velocityYAfterApplicationOfForces =
      (velocityY + accelerationY * timePerFrame) * frictionAmbientCoef
    const velocityAngleAfterApplicationOfForces = gameObject.angleLocked
      ? 0
      : (velocityAngle + accelerationAngle * timePerFrame) * frictionAmbientCoef

    // update velocity
    gameObject.velocityX = velocityXAfterApplicationOfForces
    gameObject.velocityY = velocityYAfterApplicationOfForces
    gameObject.velocityAngle = velocityAngleAfterApplicationOfForces

    const centerX = gameObject.centerX
    const centerXAfterApplicationOfVelocity =
      centerX + velocityXAfterApplicationOfForces * timePerFrame
    const centerY = gameObject.centerY
    const centerYAfterApplicationOfVelocity =
      centerY + velocityYAfterApplicationOfForces * timePerFrame
    const angle = gameObject.angle
    const angleAfterApplicationOfVelocity =
      angle + velocityAngleAfterApplicationOfForces * timePerFrame

    // no move
    if (
      centerX === centerXAfterApplicationOfVelocity &&
      centerY === centerYAfterApplicationOfVelocity &&
      angle === angleAfterApplicationOfVelocity
    ) {
      return
    }

    gameObject.centerX = centerXAfterApplicationOfVelocity
    gameObject.centerY = centerYAfterApplicationOfVelocity
    gameObject.angle = angleAfterApplicationOfVelocity
    positionUpdates.push({
      gameObject,
      from: {
        centerX,
        centerY,
        angle,
      },
      to: {
        centerX: centerXAfterApplicationOfVelocity,
        centerY: centerYAfterApplicationOfVelocity,
        angle: angleAfterApplicationOfVelocity,
      },
    })
  })

  return positionUpdates
}

export const getTotalForces = (forces) => {
  let forceXTotal = 0
  let forceYTotal = 0
  let forceAngleTotal = 0
  forces.forEach(({ x = 0, y = 0, angle = 0 }) => {
    forceXTotal += x
    forceYTotal += y
    forceAngleTotal += angle
  })
  return {
    x: forceXTotal,
    y: forceYTotal,
    angle: forceAngleTotal,
  }
}

export const motionAllowedFromMass = (mass) => {
  // object with a negative mass would move to -Infinity
  if (mass < 0) {
    return false
  }

  // object without mass (0) would move to +Infinity
  if (mass === 0) {
    return false
  }

  // object with Infinity mass cannot move -> they tend to 0
  if (mass === Infinity) {
    return false
  }

  return true
}

const warnForcesIgnored = (gameObject) => {
  console.warn(`found forces on object unable of motion, all forces ignored.
--- game object name ---
${gameObject.name}
--- forces ---
${JSON.stringify(gameObject.forces, null, "  ")}`)
}

const warnVelocityIgnored = (gameObject) => {
  console.warn(
    `found velocity on object unable of motion, all velocity forced to zero.
--- game object name ---
${gameObject.name}`,
  )
}
