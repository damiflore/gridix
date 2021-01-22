import { getDistanceBetweenTwoPoints, blocToCenterPoint, blocCollidesWithBloc } from "./geometry.js"
import { mutateBloc } from "./bloc.js"

export const blocEffectCollisionDetection = {
  "collision-detection": (bloc, { blocs }) => {
    const blocCollidingArray = blocCollidingArrayGetter(bloc, blocs)
    return {
      blocCollidingArray,
    }
  },
}

export const blocCollidingArrayGetter = (bloc, blocs) => {
  return blocs.filter((blocCandidate) => {
    if (blocCandidate === bloc) {
      return false
    }
    return blocCollidesWithBloc(blocCandidate, bloc)
  })
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

export const blocEffectCollisionResolution = {
  "collision-resolution": (bloc) => {
    bloc.blocCollidingArray.forEach((blocColliding) => {
      const blocCenterPoint = blocToCenterPoint(bloc)
      const blocCollidingCenterPoint = blocToCenterPoint(blocColliding)

      const centerXDiff = blocCenterPoint.x - blocCollidingCenterPoint.x
      const centerYDiff = blocCenterPoint.y - blocCollidingCenterPoint.y
      // Half widths and half heights of the objects
      const ww2 = bloc.width / 2 + blocColliding.width / 2
      const hh2 = bloc.height / 2 + blocColliding.height / 2

      // if the x and y vector are less than the half width or half height,
      // they we must be inside the object, causing a collision
      if (Math.abs(centerXDiff) < ww2 && Math.abs(centerYDiff) < hh2) {
        // figures out on which side we are colliding (top, bottom, left, or right)
        const oX = ww2 - Math.abs(centerXDiff)
        const oY = hh2 - Math.abs(centerYDiff)
        if (oX >= oY) {
          if (centerYDiff > 0) {
            bloc.positionY += oY
          } else {
            bloc.positionY -= oY
          }
        } else if (centerXDiff > 0) {
          bloc.positionX += oX
        } else {
          bloc.positionX -= oX
        }
      }
    })
  },
}

export const blocToMoveDirection = ({ velocityX, velocityY }) => {
  return {
    movingLeft: velocityX < 0,
    movingTop: velocityY < 0,
    movingRight: velocityX > 0,
    movingBottom: velocityY > 0,
  }
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

// https://github.com/liabru/matter-js/issues/5
// http://www.stencyl.com/help/view/continuous-collision-detection
export const blocEffectCollisionResolutionBounce = {
  "collision-resolution-bounce": (bloc) => {
    bloc.blocCollidingArray.forEach((blocColliding) => {
      const { collisionSpeed, collisionVectorNormalized } = getCollisionImpact(bloc, blocColliding)

      const impulse = (2 * collisionSpeed) / (bloc.mass + blocColliding.mass)
      mutateBloc(bloc, {
        velocityX: bloc.velocityX - impulse * blocColliding.mass * collisionVectorNormalized.x,
        velocityY: bloc.velocityY - impulse * blocColliding.mass * collisionVectorNormalized.y,
      })
      mutateBloc(blocColliding, {
        velocityX: blocColliding.velocityX + impulse * bloc.mass * collisionVectorNormalized.x,
        velocityY: blocColliding.velocityY + impulse * bloc.mass * collisionVectorNormalized.y,
      })
    })
  },
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

export const blocEffectCollisionResolutionFriction = {
  "collision-resolution-friction": () => {},
}
