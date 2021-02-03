/* eslint-disable operator-assignment */
// import { PHYSIC_CONSTANTS } from "./physic.constants.js"
// import { limitNumberPrecision } from "../math/limitNumberPrecision.js"

// const limitVelocityPrecision = limitNumberPrecision(4)

export const handleMotion = ({ rigidBodies, stepInfo }) => {
  const { timePerFrame } = stepInfo
  const positionUpdates = []
  rigidBodies.forEach((rigidBody) => {
    if (rigidBody.debugMotion) {
      rigidBody.debugMotion = false
      // eslint-disable-next-line no-debugger
      debugger
    }

    const { mass, velocityX, velocityY, velocityAngle, forces } = rigidBody
    const motionAllowedByMass = motionAllowedFromMass(mass)
    if (!motionAllowedByMass) {
      if (forces.length > 0) {
        if (import.meta.dev) {
          warnForcesIgnored(rigidBody)
        }
        forces.length = 0
      }
      if (velocityX || velocityY || velocityAngle) {
        if (import.meta.dev) {
          warnVelocityIgnored(rigidBody)
        }
        rigidBody.velocityX = rigidBody.velocityY = rigidBody.velocityAngle = 0
      }
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
    forces.length = 0
    rigidBody.forceX = forceTotal.x
    rigidBody.forceY = forceTotal.y
    rigidBody.forceAngle = forceTotal.angle

    if (rigidBody.sleeping) {
      return
    }

    // in theory we should divide all forces by the mass
    // but in practice it would be more efficient to take the force as it is
    // and when some code wants to apply force, it divide is by the mass if
    // if the force is a constant that is not proportional to the mass
    const forceDivider = mass
    const frictionAmbientCoef = 1 - rigidBody.frictionAmbient
    const accelerationX = forceTotal.x / forceDivider
    const accelerationY = forceTotal.y / forceDivider
    const accelerationAngle = forceTotal.angle / forceDivider

    const velocityXAfterApplicationOfForces =
      (velocityX + accelerationX * timePerFrame) * frictionAmbientCoef
    const velocityYAfterApplicationOfForces =
      (velocityY + accelerationY * timePerFrame) * frictionAmbientCoef
    const velocityAngleAfterApplicationOfForces = rigidBody.angleLocked
      ? 0
      : (velocityAngle + accelerationAngle * timePerFrame) * frictionAmbientCoef

    // update velocity
    rigidBody.velocityX = velocityXAfterApplicationOfForces
    rigidBody.velocityY = velocityYAfterApplicationOfForces
    rigidBody.velocityAngle = velocityAngleAfterApplicationOfForces

    const { centerX, centerY, angle } = rigidBody
    const centerXAfterApplicationOfVelocity =
      centerX + velocityXAfterApplicationOfForces * timePerFrame
    const centerYAfterApplicationOfVelocity =
      centerY + velocityYAfterApplicationOfForces * timePerFrame
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

    rigidBody.centerX = centerXAfterApplicationOfVelocity
    rigidBody.centerY = centerYAfterApplicationOfVelocity
    rigidBody.angle = angleAfterApplicationOfVelocity
    positionUpdates.push({
      rigidBody,
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

export const addImpulse = (rigidBody, { x = 0, y = 0, angle = 0 }) => {
  const { mass } = rigidBody

  rigidBody.forces.push({
    x: x * mass,
    y: y * mass,
    angle: angle * mass,
  })
}

export const addForce = (rigidBody, force) => {
  rigidBody.forces.push(force)
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

const warnForcesIgnored = (rigidBody) => {
  const { forces } = rigidBody
  forces.forEach((force) => {
    if (force.origin) {
      console.warn(
        `Tried to apply forces on object uanble of motion: ${force.origin.name} cannot add force to ${rigidBody.name}.`,
      )
    } else if (force.name) {
      console.warn(
        `Tried to apply forces on object uanble of motion: cannot add ${force.name} to ${rigidBody.name}.`,
      )
    } else {
      console.warn(`Tried to apply forces on object uanble of motion`)
    }
  })
}

const warnVelocityIgnored = (rigidBody) => {
  console.warn(
    `found velocity on object unable of motion, all velocity forced to zero.
--- rigid body name ---
${rigidBody.name}`,
  )
}
