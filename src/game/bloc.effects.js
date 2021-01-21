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
      if (bloc.name === "wall") return

      // get the vectors to check against
      var vX = bloc.positionX + bloc.width / 2 - (blocColliding.positionX + blocColliding.width / 2)
      var vY =
        bloc.positionY + bloc.height / 2 - (blocColliding.positionY + blocColliding.height / 2)
      // Half widths and half heights of the objects
      var ww2 = bloc.width / 2 + blocColliding.width / 2
      var hh2 = bloc.height / 2 + blocColliding.height / 2
      var colDir = ""

      // if the x and y vector are less than the half width or half height,
      // they we must be inside the object, causing a collision
      if (Math.abs(vX) < ww2 && Math.abs(vY) < hh2) {
        // figures out on which side we are colliding (top, bottom, left, or right)
        var oX = ww2 - Math.abs(vX)
        var oY = hh2 - Math.abs(vY)
        if (oX >= oY) {
          if (vY > 0) {
            colDir = "TOP"
            bloc.positionY += oY
          } else {
            colDir = "BOTTOM"
            bloc.positionY -= oY
          }
        } else if (vX > 0) {
          colDir = "LEFT"
          bloc.positionX += oX
        } else {
          colDir = "RIGHT"
          bloc.positionX -= oX
        }
      }
      return colDir
    })
  },

  // "collision-resolution": (bloc) => {
  //   const blocVelocityX = bloc.velocityX
  //   const blocVelocityY = bloc.velocityY
  //   if (blocVelocityX === 0 && blocVelocityY === 0) {
  //     return
  //   }

  //   if (Math.abs(bloc.velocityX) < 0.1) {
  //     bloc.velocityX = 0
  //   }
  //   if (Math.abs(bloc.velocityY) < 0.1) {
  //     bloc.velocityY = 0
  //   }

  //   const { movingLeft, movingTop, movingRight, movingBottom } = blocToMoveDirection({
  //     velocityX: bloc.velocityX,
  //     velocityY: bloc.velocityY,
  //   })

  //   const candidates = []

  //   const addCandidate = ({ positionX = bloc.positionX, positionY = bloc.positionY }) => {
  //     candidates.push({
  //       positionX,
  //       positionY,
  //     })
  //   }

  //   bloc.blocCollidingArray.forEach((blocColliding) => {
  //     const leftMoveIsColliding = movingLeft && getCollisionLeftLength(bloc, blocColliding)
  //     const topMoveIsColliding = movingTop && getCollisionTopLength(bloc, blocColliding)
  //     const rightMoveIsColliding = movingRight && getCollisionRightLength(bloc, blocColliding)
  //     const bottomMoveIsColliding = movingBottom && getCollisionBottomLength(bloc, blocColliding)

  //     const addBottomRightCandidate = () => {
  //       addCandidate({
  //         positionX: blocColliding.positionX + blocColliding.width,
  //         positionY: blocColliding.positionY + blocColliding.height,
  //       })
  //     }
  //     const addTopRightCandidate = () => {
  //       addCandidate({
  //         positionX: blocColliding.positionX + blocColliding.width,
  //         positionY: blocColliding.positionY - bloc.height,
  //       })
  //     }
  //     const addTopLeftCandidate = () => {
  //       addCandidate({
  //         positionX: blocColliding.positionX - bloc.width,
  //         positionY: blocColliding.positionY - bloc.height,
  //       })
  //     }
  //     const addBottomLeftCandidate = () => {
  //       addCandidate({
  //         positionX: blocColliding.positionX - bloc.width,
  //         positionY: blocColliding.positionY + blocColliding.height,
  //       })
  //     }
  //     const addLeftCandidate = () => {
  //       addCandidate({
  //         positionX: blocColliding.positionX - bloc.width,
  //       })
  //     }
  //     const addRightCandidate = () => {
  //       addCandidate({
  //         positionX: blocColliding.positionX + blocColliding.width,
  //       })
  //     }
  //     const addTopCandidate = () => {
  //       addCandidate({
  //         positionY: blocColliding.positionY - bloc.height,
  //       })
  //     }
  //     const addBottomCandidate = () => {
  //       addCandidate({
  //         positionY: blocColliding.positionY + blocColliding.height,
  //       })
  //     }

  //     if (topMoveIsColliding && leftMoveIsColliding) {
  //       addBottomCandidate()
  //       addRightCandidate()
  //       addBottomRightCandidate()
  //       return
  //     }
  //     if (bottomMoveIsColliding && leftMoveIsColliding) {
  //       addTopCandidate()
  //       addRightCandidate()
  //       addTopRightCandidate()
  //       return
  //     }
  //     if (topMoveIsColliding && rightMoveIsColliding) {
  //       addBottomCandidate()
  //       addLeftCandidate()
  //       addBottomLeftCandidate()
  //       return
  //     }
  //     if (bottomMoveIsColliding && rightMoveIsColliding) {
  //       addTopCandidate()
  //       addRightCandidate()
  //       addTopLeftCandidate()
  //       return
  //     }
  //     if (leftMoveIsColliding) {
  //       addRightCandidate()
  //       return
  //     }
  //     if (rightMoveIsColliding) {
  //       addLeftCandidate()
  //       return
  //     }
  //     if (topMoveIsColliding) {
  //       addBottomCandidate()
  //       return
  //     }
  //     if (bottomMoveIsColliding) {
  //       addTopCandidate()
  //       return
  //     }
  //   })

  //   const candidatesWithoutCollision = candidates.filter((candidate) => {
  //     return bloc.blocCollidingArray.every((blocColliding) => {
  //       const collides = rectangleCollidesRectangle(
  //         {
  //           positionX: candidate.positionX,
  //           positionY: candidate.positionY,
  //           width: bloc.width,
  //           height: bloc.height,
  //         },
  //         blocColliding,
  //       )
  //       return !collides
  //     })
  //   })
  //   if (candidatesWithoutCollision.length === 0) {
  //     // no way candidate can prevent collision
  //   } else {
  //     mutateBloc(bloc, candidatesWithoutCollision[0])
  //   }
  // },
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
