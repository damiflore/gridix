import { forEachPairs } from "src/helper/pairs.js"
import { getCollisionInfo } from "./collisionInfo.js"

export const forEachCollidingPairs = ({
  rigidBodies,
  canCollidePredicate = () => true,
  pairCollisionCallback,
}) => {
  forEachPairs(rigidBodies, (a, b) => {
    if (canCollidePredicate(a, b)) {
      const collisionInfo = getCollisionInfo(a, b)
      if (collisionInfo) {
        pairCollisionCallback(a, b, collisionInfo)
      }
    }
  })
}
