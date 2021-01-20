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

export const blocEffectCollision = {
  collision: (bloc) => {
    const blocVelocityX = bloc.velocityX
    const blocVelocityY = bloc.velocityY
    if (blocVelocityX === 0 && blocVelocityY === 0) {
      return
    }

    const blocLeft = bloc.positionX
    const blocTop = bloc.positionY
    const blocRight = blocLeft + bloc.width
    const blocBottom = blocTop + bloc.height
    const isMovingRight = blocVelocityX > 0
    const isMovingLeft = blocVelocityX < 0
    const isMovingTop = blocVelocityY < 0
    const isMovingBottom = blocVelocityY > 0

    bloc.blocCollidingArray.forEach((blocColliding) => {
      const blocCollidingLeft = blocColliding.positionX
      const blocCollidingRight = blocCollidingLeft + blocColliding.width
      const blocCollidingTop = blocColliding.positionY
      const blocCollidingBottom = blocCollidingTop + blocColliding.height

      const leftCollisionLength =
        blocLeft < blocCollidingRight && blocLeft > blocCollidingLeft
          ? blocLeft - blocCollidingRight
          : 0
      const rightCollisionLength =
        blocRight > blocCollidingLeft && blocRight < blocCollidingRight
          ? blocRight - blocCollidingLeft
          : 0
      const topCollisionLength =
        blocTop < blocCollidingBottom && blocTop > blocCollidingTop
          ? blocTop - blocCollidingBottom
          : 0
      const bottomCollidisionLength =
        blocBottom > blocCollidingTop && blocBottom < blocCollidingBottom
          ? blocBottom - blocCollidingTop
          : 0

      const positionXCandidate =
        isMovingRight && rightCollisionLength
          ? blocCollidingLeft - bloc.width
          : isMovingLeft && leftCollisionLength
          ? blocCollidingRight
          : undefined
      const positionYCandidate =
        isMovingTop && topCollisionLength
          ? blocCollidingTop + bloc.height
          : isMovingBottom && bottomCollidisionLength
          ? blocCollidingBottom
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
        // try to alter only X and see if this is enought
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

// https://github.com/liabru/matter-js/issues/5
// http://www.stencyl.com/help/view/continuous-collision-detection
// en gros il faudrait que, par défault
// lorsqu'un rectangle est en collision avec un autre
// il soit renvoyé d'ou il venait initialement
// (on peut utiliser sa vélocité pour en déduire d'ou il venait)
export const blocEffectBounce = {
  bounce: (bloc) => {
    bloc.blocCollidingArray.forEach((blocColliding) => {
      const blocCenterPoint = blocToCenterPoint(bloc)
      const blocCollidingCenterPoint = blocToCenterPoint(blocColliding)

      const collisionVector = {
        x: blocCollidingCenterPoint.x - blocCenterPoint.x,
        y: blocCollidingCenterPoint.y - blocCenterPoint.y,
      }
      const distanceBetweenBlocs = getDistanceBetweenTwoPoints(
        blocCollidingCenterPoint,
        blocCenterPoint,
      )
      const collisionVectorNormalized = {
        x: collisionVector.x / distanceBetweenBlocs,
        y: collisionVector.y / distanceBetweenBlocs,
      }
      const velocityRelativeVector = {
        x: bloc.velocityX - blocColliding.velocityX,
        y: bloc.velocityY - blocColliding.velocityY,
      }
      let speed =
        velocityRelativeVector.x * collisionVectorNormalized.x +
        velocityRelativeVector.y * collisionVectorNormalized.y
      speed *= Math.min(bloc.restitution, blocColliding.restitution)

      if (speed < 0) {
        return
      }

      const impulse = (2 * speed) / (bloc.mass + blocColliding.mass)
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
