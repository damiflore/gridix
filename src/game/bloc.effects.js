import { getDistanceBetweenTwoPoints, blocToCenterPoint, blocCollidesWithBloc } from "./geometry.js"
import { mutateBloc } from "./bloc.js"

export const blocEffectCollision = {
  collision: (bloc, { blocs }) => {
    const blocCollidingArray = blocCollidingArrayGetter(bloc, blocs)
    return {
      blocCollidingArray,
    }
  },
}

const blocCollidingArrayGetter = (bloc, blocs) => {
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
