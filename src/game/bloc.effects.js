/* eslint-disable no-nested-ternary */
import {
  getDistanceBetweenTwoPoints,
  blocToCenterPoint,
  blocCollidesWithBloc,
  rectangleCollidesRectangle,
} from "./geometry.js"
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
      } else if (blocTop < containerTop) {
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
    const blocVelocityX = bloc.velocityX
    const blocVelocityY = bloc.velocityY
    if (blocVelocityX === 0 && blocVelocityY === 0) {
      return
    }

    const { movingLeft, movingTop, movingRight, movingBottom } = blocToMoveDirection(bloc)

    bloc.blocCollidingArray.forEach((blocColliding) => {
      const {
        collisionLeftLength,
        collisionTopLength,
        collisionRightLength,
        collisionBottomLength,
      } = getCollisionLength(bloc, blocColliding)

      const positionXCandidate =
        movingLeft && collisionLeftLength
          ? blocColliding.positionX + blocColliding.width
          : movingRight && collisionRightLength
          ? blocColliding.positionX - bloc.width
          : undefined
      const positionYCandidate =
        movingTop && collisionTopLength
          ? blocColliding.positionY + blocColliding.height
          : movingBottom && collisionBottomLength
          ? blocColliding.positionY - bloc.height
          : undefined

      if (positionXCandidate !== undefined && positionYCandidate !== undefined) {
        // try to move the smallest distance first
        // and see if this is enough to prevent the collision
        const positionXDistance = Math.abs(positionXCandidate - bloc.positionX)
        const positionYDistance = Math.abs(positionYCandidate - bloc.positionY)
        if (positionXDistance > positionYDistance) {
          // try to alter only Y and see if this is enough
          const yAloneIsCollisionFree = !rectangleCollidesRectangle(
            {
              positionX: bloc.positionX,
              positionY: positionYCandidate,
              width: bloc.width,
              height: bloc.height,
            },
            blocColliding,
          )
          if (yAloneIsCollisionFree) {
            mutateBloc(bloc, { positionY: positionYCandidate })
            return
          }
        }
        // try to alter only X and see if this is enough
        const xAloneIsCollisionFree = !rectangleCollidesRectangle(
          {
            positionX: positionXCandidate,
            positionY: bloc.positionY,
            width: bloc.width,
            height: bloc.height,
          },
          blocColliding,
        )
        if (xAloneIsCollisionFree) {
          mutateBloc(bloc, { positionX: positionXCandidate })
          return
        }

        mutateBloc(bloc, { positionX: positionXCandidate, positionY: positionYCandidate })
        return
      }

      if (positionYCandidate !== undefined) {
        mutateBloc(bloc, { positionY: positionYCandidate })
        return
      }

      if (positionXCandidate !== undefined) {
        mutateBloc(bloc, { positionX: positionXCandidate })
        return
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

export const getCollisionLength = (blocA, blocB) => {
  const blocALeft = blocA.positionX
  const blocATop = blocA.positionY
  const blocARight = blocALeft + blocA.width
  const blocABottom = blocATop + blocA.height

  const blocBLeft = blocB.positionX
  const blocBTop = blocB.positionY
  const blocBRight = blocBLeft + blocB.width
  const blocBBottom = blocBTop + blocB.height

  const collisionLeftLength =
    blocALeft < blocBRight && blocALeft > blocBLeft ? blocALeft - blocBRight : 0

  const collisionTopLength =
    blocATop < blocBBottom && blocATop > blocBTop ? blocATop - blocBBottom : 0

  const collisionRightLength =
    blocARight > blocBLeft && blocARight < blocBRight ? blocARight - blocBLeft : 0

  const collisionBottomLength =
    blocABottom > blocBTop && blocABottom < blocBBottom ? blocABottom - blocBTop : 0

  return {
    collisionTopLength,
    collisionLeftLength,
    collisionBottomLength,
    collisionRightLength,
  }
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
