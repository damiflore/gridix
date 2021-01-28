import { getCollisionInfo } from "../collision/collisionInfo.js"
import { forEachPairs } from "../helper/pairs.js"

export const forEachCollidingPairs = ({
  gameObjects,
  canCollidePredicate = () => true,
  pairCollisionCallback,
}) => {
  forEachPairs(gameObjects, (a, b) => {
    if (canCollidePredicate(a, b)) {
      const collisionInfo = getCollisionInfo(a, b)
      if (collisionInfo) {
        if (a.debugCollisionDetection || b.debugCollisionDetection) {
          a.debugCollisionDetection = false
          b.debugCollisionDetection = false
          // eslint-disable-next-line no-debugger
          debugger
        }
        pairCollisionCallback(a, b, collisionInfo)
      }
    }
  })
}
