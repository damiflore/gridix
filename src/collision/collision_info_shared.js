export const createCollisionInfo = ({
  collisionDepth = 0,
  collisionNormalX = 0,
  collisionNormalY = 0,
  collisionStartX = 0,
  collisionStartY = 0,
  collisionEndX = collisionStartX + collisionNormalX * collisionDepth,
  collisionEndY = collisionStartY + collisionNormalY * collisionDepth,
}) => {
  return {
    collisionDepth,
    collisionNormalX,
    collisionNormalY,
    collisionStartX,
    collisionStartY,
    collisionEndX,
    collisionEndY,
  };
};
