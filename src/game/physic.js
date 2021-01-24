/* eslint-disable operator-assignment */
import { mutateBloc } from "./bloc.js"
import { blocToCenterPoint, blocCollidesWithBloc, getDistanceBetweenTwoPoints } from "./geometry.js"

export const updatePhysicForArcadeGame = (
  blocs,
  {
    // msEllapsed since last physic update
    msEllapsed,
  },
) => {
  const collisionPairs = detectCollisionPairs(blocs)

  // update velocity
  blocs.forEach((bloc) => {
    applyForcesOnVelocity(bloc, { msEllapsed })
  })
  // solve velocity of colliding pairs
  collisionPairs.forEach((collisionPair) => {
    const [blocA, blocB] = collisionPair
    applyCollisionImpactOnVelocity(blocA, blocB)
  })
  // update position
  blocs.forEach((bloc) => {
    applyVelocityOnPosition(bloc, { msEllapsed })
  })
  // solve position of colliding pairs
  collisionPairs.forEach((collisionPair) => {
    const [blocA, blocB] = collisionPair
    applyCollisionImpactOnPosition(blocA, blocB)
  })
}

const detectCollisionPairs = (blocs) => {
  return findPairs(blocs, (blocA, blocB) => {
    return blocCollidesWithBloc(blocA, blocB)
  })
}

export const findPairs = (array, pairPredicate) => {
  const pairs = []

  let i = 0
  while (i < array.length) {
    const value = array[i]
    i++
    let j = i
    while (j < array.length) {
      const otherValue = array[j]
      j++
      if (pairPredicate(value, otherValue)) {
        pairs.push([value, otherValue])
      }
    }
  }

  return pairs
}

const applyForcesOnVelocity = (bloc, { msEllapsed }) => {
  const secondsEllapsed = msEllapsed / 1000
  let velocityXDelta = 0
  let velocityYDelta = 0

  // apply acceleration on velocity
  // https://codepen.io/OliverBalfour/post/implementing-velocity-acceleration-and-friction-on-a-canvas
  // https://github.com/MassiveHeights/Black/blob/e4967f19cbdfe42b3612981c810ac499ad34b154/src/physics/arcade/Arcade.js#L587
  const { accelerationX, accelerationY } = bloc
  velocityXDelta = accelerationX * secondsEllapsed
  velocityYDelta = accelerationY * secondsEllapsed

  // apply ambient friction (air, water) on the desired velocity update
  // https://codepen.io/OliverBalfour/post/implementing-velocity-acceleration-and-friction-on-a-canvas
  const { frictionAmbient } = bloc
  const frictionAmbientCoef = 1 - frictionAmbient
  velocityXDelta = velocityXDelta * frictionAmbientCoef
  velocityYDelta = velocityYDelta * frictionAmbientCoef
  // const speed = Math.sqrt(velocityX * velocityX + velocityY * velocityY)
  //     const angle = Math.atan2(velocityY, velocityX)
  //     if (speed > friction) {
  //       speed -= friction
  //     } else {
  //       speed = 0
  //     }
  //     return {
  //       velocityX: Math.cos(angle) * speed,
  //       velocityY: Math.sin(angle) * speed,
  //     }

  const { velocityX, velocityY } = bloc
  const velocityXAfterUpdate = velocityX + velocityXDelta
  const velocityYAfterUpdate = velocityY + velocityYDelta

  mutateBloc({
    velocityX: velocityXAfterUpdate,
    velocityY: velocityYAfterUpdate,
  })
}

const applyVelocityOnPosition = (bloc, { msEllapsed }) => {
  const secondsEllapsed = msEllapsed / 1000
  // apply velocity on position
  const { velocityX, velocityY, positionX, positionY } = bloc
  const positionXAfterUpdate = positionX + velocityX * secondsEllapsed
  const positionYAfterUpdate = positionY + velocityY * secondsEllapsed
  mutateBloc(bloc, {
    positionX: positionXAfterUpdate,
    positionY: positionYAfterUpdate,
  })
}

const applyCollisionImpactOnVelocity = (blocA, blocB) => {
  const { collisionSpeed, collisionVectorNormalized } = getCollisionImpact(blocA, blocB)

  const impulse = (2 * collisionSpeed) / (blocA.mass + blocB.mass)
  mutateBloc(blocA, {
    velocityX: blocA.velocityX - impulse * blocB.mass * collisionVectorNormalized.x,
    velocityY: blocA.velocityY - impulse * blocB.mass * collisionVectorNormalized.y,
  })
  mutateBloc(blocA, {
    velocityX: blocB.velocityX + impulse * blocA.mass * collisionVectorNormalized.x,
    velocityY: blocB.velocityY + impulse * blocA.mass * collisionVectorNormalized.y,
  })
}

const getCollisionImpact = (blocA, blocB) => {
  const blocACenterPoint = blocToCenterPoint(blocA)
  const blocBCenterPoint = blocToCenterPoint(blocB)

  const collisionVector = {
    x: blocBCenterPoint.x - blocACenterPoint.x,
    y: blocBCenterPoint.y - blocACenterPoint.y,
  }
  const distanceBetweenBlocs = getDistanceBetweenTwoPoints(blocBCenterPoint, blocACenterPoint)
  const collisionVectorNormalized = {
    x: collisionVector.x / distanceBetweenBlocs,
    y: collisionVector.y / distanceBetweenBlocs,
  }
  const velocityRelativeVector = {
    x: blocA.velocityX - blocB.velocityX,
    y: blocA.velocityY - blocB.velocityY,
  }
  let speed =
    velocityRelativeVector.x * collisionVectorNormalized.x +
    velocityRelativeVector.y * collisionVectorNormalized.y
  speed *= Math.min(blocA.restitution, blocB.restitution)

  return {
    collisionSpeed: speed,
    collisionVectorNormalized,
  }
}

// How many pixels colliders can overlap each other without resolve
const SLOP = 1
// Position correction koefficient. Lower is softer and with less twitches.
const BAUMGARTE = 0.2

const applyCollisionImpactOnPosition = (blocA, blocB) => {
  const { collisionVectorNormalized } = getCollisionImpact(blocA, blocB)

  const normalX = collisionVectorNormalized.x
  const normalY = collisionVectorNormalized.y
  const blocAMassInverted = 1 / blocA.mass
  const blocBMassInverted = 1 / blocB.mass
  const massSumInverted = 1 / (blocAMassInverted + blocBMassInverted)

  const invMassA = blocAMassInverted
  const invMassB = blocBMassInverted
  const positionA = {
    x: blocA.positionX,
    y: blocA.positionY,
  }
  const positionB = {
    x: blocB.positionX,
    y: blocB.positionY,
  }
  const offset = {
    x: positionB.x - positionA.x,
    y: positionB.y - positionA.y,
  }

  const dx = offset.x - positionB.x + positionA.x
  const dy = offset.y - positionB.y + positionA.y

  const overlap = this.mOverlap + (dx * normalX + dy * normalY)
  const correction = (overlap - SLOP) * BAUMGARTE

  if (correction <= 0) return

  const normalImpulse = correction * massSumInverted

  const impulseX = normalImpulse * normalX
  const impulseY = normalImpulse * normalY

  positionA.x -= impulseX * invMassA
  positionA.y -= impulseY * invMassA

  positionB.x += impulseX * invMassB
  positionB.y += impulseY * invMassB
}

// Check this to fix moving rectangle collision:
// https://gamedev.stackexchange.com/questions/15836/collision-resolution-in-case-of-collision-with-multiple-objects
// check both for previous and current position?
// https://www.reddit.com/r/mathematics/comments/egs7n8/moving_rectangles_collisions/fcapn2z/?utm_source=reddit&utm_medium=web2x&context=3

// https://github.com/MassiveHeights/Black/blob/e4967f19cbdfe42b3612981c810ac499ad34b154/src/physics/arcade/pairs/Pair.js#L295
// ne pas faire si l'objet est statique
// const applyCollisionImpactOnPositionOld = (blocA, blocB) => {
//   const blocACenterPoint = blocToCenterPoint(blocA)
//   const blocBCenterPoint = blocToCenterPoint(blocB)

//   const centerXDiff = blocACenterPoint.x - blocBCenterPoint.x
//   const centerYDiff = blocACenterPoint.y - blocBCenterPoint.y
//   // Half widths and half heights of the objects
//   const ww2 = blocA.width / 2 + blocB.width / 2
//   const hh2 = blocA.height / 2 + blocB.height / 2

//   // if the x and y vector are less than the half width or half height,
//   // they we must be inside the object, causing a collision
//   if (Math.abs(centerXDiff) < ww2 && Math.abs(centerYDiff) < hh2) {
//     // figures out on which side we are colliding (top, bottom, left, or right)
//     const oX = ww2 - Math.abs(centerXDiff)
//     const oY = hh2 - Math.abs(centerYDiff)
//     if (oX >= oY) {
//       if (centerYDiff > 0) {
//         blocA.positionY += oY
//       } else {
//         blocA.positionY -= oY
//       }
//     } else if (centerXDiff > 0) {
//       blocA.positionX += oX
//     } else {
//       blocA.positionX -= oX
//     }
//   }
// }
