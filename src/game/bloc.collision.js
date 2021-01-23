import { getDistanceBetweenTwoPoints, blocToCenterPoint, blocCollidesWithBloc } from "./geometry.js"
import { mutateBloc } from "./bloc.js"

export const detectAndResolveCollision = (bloc, { blocs }) => {
  const blocCollidingArray = blocCollidingArrayGetter(bloc, blocs)

  blocCollidingArray.forEach((blocColliding) => {
    applyCollisionImpactOnVelocity(bloc, blocColliding)
    // applyCollisioImpactOnPosition(bloc, blocColliding)
  })
  blocCollidingArray.forEach((blocColliding) => {
    applyCollisioImpactOnPosition(bloc, blocColliding)
  })

  mutateBloc(bloc, {
    blocCollidingArray,
  })
}

// https://github.com/MassiveHeights/Black/blob/e4967f19cbdfe42b3612981c810ac499ad34b154/src/physics/arcade/pairs/Pair.js#L295
// ne pas faire si l'objet est statique
const applyCollisioImpactOnPosition = (firstBloc, secondBloc) => {
  const firstBlocCenterPoint = blocToCenterPoint(firstBloc)
  const secondBlocCenterPoint = blocToCenterPoint(secondBloc)

  const centerXDiff = firstBlocCenterPoint.x - secondBlocCenterPoint.x
  const centerYDiff = firstBlocCenterPoint.y - secondBlocCenterPoint.y
  // Half widths and half heights of the objects
  const ww2 = firstBloc.width / 2 + secondBloc.width / 2
  const hh2 = firstBloc.height / 2 + secondBloc.height / 2

  // if the x and y vector are less than the half width or half height,
  // they we must be inside the object, causing a collision
  if (Math.abs(centerXDiff) < ww2 && Math.abs(centerYDiff) < hh2) {
    // figures out on which side we are colliding (top, bottom, left, or right)
    const oX = ww2 - Math.abs(centerXDiff)
    const oY = hh2 - Math.abs(centerYDiff)
    if (oX >= oY) {
      if (centerYDiff > 0) {
        firstBloc.positionY += oY
      } else {
        firstBloc.positionY -= oY
      }
    } else if (centerXDiff > 0) {
      firstBloc.positionX += oX
    } else {
      firstBloc.positionX -= oX
    }
  }
}

// https://spicyyoghurt.com/tutorials/html5-javascript-game-development/collision-detection-physics
// it's missing friction that have an impact on impulse:
// https://github.com/MassiveHeights/Black/blob/e4967f19cbdfe42b3612981c810ac499ad34b154/src/physics/arcade/pairs/Pair.js#L273
const applyCollisionImpactOnVelocity = (firstBloc, secondBloc) => {
  const { collisionSpeed, collisionVectorNormalized } = getCollisionImpact(firstBloc, secondBloc)

  const impulse = (2 * collisionSpeed) / (firstBloc.mass + secondBloc.mass)
  mutateBloc(firstBloc, {
    velocityX: firstBloc.velocityX - impulse * secondBloc.mass * collisionVectorNormalized.x,
    velocityY: firstBloc.velocityY - impulse * secondBloc.mass * collisionVectorNormalized.y,
  })
  mutateBloc(secondBloc, {
    velocityX: secondBloc.velocityX + impulse * firstBloc.mass * collisionVectorNormalized.x,
    velocityY: secondBloc.velocityY + impulse * firstBloc.mass * collisionVectorNormalized.y,
  })
}

export const blocCollidingArrayGetter = (bloc, blocs) => {
  return blocs.filter((blocCandidate) => {
    if (blocCandidate === bloc) {
      return false
    }
    return blocCollidesWithBloc(blocCandidate, bloc)
  })
}

export const getCollisionImpact = (blocA, blocB) => {
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

export const blocEffectContainer = {
  container: (blocContainer, { blocs }) => {
    blocs.forEach((bloc) => {
      const { velocityX, velocityY } = bloc
      const blocLeft = bloc.positionX
      const blocWidth = bloc.width
      const blocRight = blocLeft + blocWidth
      const blocTop = bloc.positionY
      const blocHeight = bloc.height
      const blocBottom = blocTop + blocHeight

      const containerLeft = blocContainer.positionX
      const containerTop = blocContainer.positionY
      const containerWidth = blocContainer.width
      const containerHeight = blocContainer.height
      const containerRight = containerLeft + containerWidth
      const containerBottom = containerTop + containerHeight
      const containerRestitution = blocContainer.restitution

      const blocMutations = {}
      if (blocLeft < containerLeft) {
        blocMutations.positionX = containerLeft
        blocMutations.velocityX = Math.abs(velocityX) * containerRestitution
      } else if (blocRight > containerRight) {
        blocMutations.positionX = containerRight - blocWidth
        blocMutations.velocityX = -Math.abs(velocityX) * containerRestitution
      }

      if (blocTop < containerTop) {
        blocMutations.positionY = containerTop
        blocMutations.velocityY = Math.abs(velocityY) * containerRestitution
      } else if (blocBottom > containerBottom) {
        blocMutations.positionY = containerBottom - blocHeight
        blocMutations.velocityY = -Math.abs(velocityY) * containerRestitution
      }

      // la mise a jour de cette position
      // impacte les autres collisions
      // ce qui peut les invalider
      // c'est pourquoi cet effet doit se produire le plus tot possible
      mutateBloc(bloc, blocMutations)
    })
  },
}

export const getCollisionLeftLength = (blocA, blocB) => {
  const blocALeft = blocA.positionX
  const blocBLeft = blocB.positionX
  const blocBRight = blocBLeft + blocB.width
  const collisionLeftLength =
    blocALeft < blocBRight && blocALeft > blocBLeft ? blocALeft - blocBRight : 0

  return collisionLeftLength
}

export const getCollisionTopLength = (blocA, blocB) => {
  const blocATop = blocA.positionY
  const blocBTop = blocB.positionY
  const blocBBottom = blocBTop + blocB.height
  const collisionTopLength =
    blocATop < blocBBottom && blocATop > blocBTop ? blocATop - blocBBottom : 0

  return collisionTopLength
}

export const getCollisionRightLength = (blocA, blocB) => {
  const blocALeft = blocA.positionX
  const blocARight = blocALeft + blocA.width
  const blocBLeft = blocB.positionX
  const blocBRight = blocBLeft + blocB.width
  const collisionRightLength =
    blocARight > blocBLeft && blocARight < blocBRight ? blocARight - blocBLeft : 0

  return collisionRightLength
}

export const getCollisionBottomLength = (blocA, blocB) => {
  const blocATop = blocA.positionY
  const blocABottom = blocATop + blocA.height
  const blocBTop = blocB.positionY
  const blocBBottom = blocBTop + blocB.height
  const collisionBottomLength =
    blocABottom > blocBTop && blocABottom < blocBBottom ? blocABottom - blocBTop : 0

  return collisionBottomLength
}
