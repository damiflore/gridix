import { forEachPairs } from "../helper/pairs.js";
import { getCollisionInfo } from "./collision_info.js";

export const forEachCollidingPairs = ({
  rigidBodies,
  canCollidePredicate = () => true,
  pairCollisionCallback,
}) => {
  forEachPairs(rigidBodies, (a, b) => {
    if (canCollidePredicate(a, b)) {
      const collisionInfo = getCollisionInfo(a, b);
      if (collisionInfo) {
        pairCollisionCallback(a, b, collisionInfo);
      }
    }
  });
};
