import {
  rectangleToCorners,
  rectangleToNormals,
} from "../geometry/rectangle.js";
import {
  getScalarProduct,
  scaleVector,
  substractVector,
} from "../geometry/vector.js";
import { createCollisionInfo } from "./collision_info_shared.js";

export const getCollisionInfoForRectangleToRectangle = (
  rectangleA,
  rectangleB,
) => {
  const firstCollisionInfo = findShortestAxisPenetration(
    rectangleA,
    rectangleB,
  );
  if (!firstCollisionInfo) {
    return null;
  }

  const secondCollisionInfo = findShortestAxisPenetration(
    rectangleB,
    rectangleA,
  );
  if (!secondCollisionInfo) {
    return null;
  }

  const firstCollisionDepth = firstCollisionInfo.collisionDepth;
  const secondCollisionDepth = secondCollisionInfo.collisionDepth;
  if (firstCollisionDepth < secondCollisionDepth) {
    const firstCollisionNormalX = firstCollisionInfo.collisionNormalX;
    const firstCollisionNormalY = firstCollisionInfo.collisionNormalY;
    const firstCollisionStartX = firstCollisionInfo.collisionStartX;
    const firstCollisionStartY = firstCollisionInfo.collisionStartY;

    return createCollisionInfo({
      collisionDepth: firstCollisionDepth,
      collisionNormalX: firstCollisionNormalX,
      collisionNormalY: firstCollisionNormalY,
      collisionStartX:
        firstCollisionStartX - firstCollisionNormalX * firstCollisionDepth,
      collisionStartY:
        firstCollisionStartY - firstCollisionNormalY * firstCollisionDepth,
    });
  }

  return createCollisionInfo({
    collisionDepth: secondCollisionDepth,
    collisionNormalX: secondCollisionInfo.collisionNormalX * -1,
    collisionNormalY: secondCollisionInfo.collisionNormalY * -1,
    collisionStartX: secondCollisionInfo.collisionStartX,
    collisionStartY: secondCollisionInfo.collisionStartY,
  });
};

const findShortestAxisPenetration = (rectangle, otherRectangle) => {
  const normals = rectangleToNormals(rectangle);
  const corners = rectangleToCorners(rectangle);
  const normalKeys = Object.keys(normals);
  const cornerKeys = Object.keys(corners);
  const otherCorners = rectangleToCorners(otherRectangle);

  let bestDistance = Infinity;
  let bestSupportPoint;
  let bestNormal;
  let i = 0;
  while (i < 4) {
    const normal = normals[normalKeys[i]];
    const corner = corners[cornerKeys[i]];
    i++;
    const normalOpposite = scaleVector(normal, -1);
    const supportPoint = findFarthestSupportPoint(
      otherCorners,
      normalOpposite,
      corner,
    );
    if (!supportPoint) {
      return null;
    }

    const { supportPointDistance } = supportPoint;
    if (supportPointDistance < bestDistance) {
      bestDistance = supportPointDistance;
      bestSupportPoint = supportPoint;
      bestNormal = normal;
    }
  }

  const bestVector = scaleVector(bestNormal, bestDistance);
  return createCollisionInfo({
    collisionDepth: bestDistance,
    collisionNormalX: bestNormal.x,
    collisionNormalY: bestNormal.y,
    collisionStartX: bestSupportPoint.supportPointX + bestVector.x,
    collisionStartY: bestSupportPoint.supportPointY + bestVector.y,
  });
};

const findFarthestSupportPoint = (corners, dir, pointOnEdge) => {
  let supportPointDistance = -Infinity;
  let supportPointX = null;
  let supportPointY = null;
  const cornerKeys = Object.keys(corners);
  let i = 0;
  while (i < 4) {
    const corner = corners[cornerKeys[i]];
    i++;
    const cornerAndPointDiff = substractVector(corner, pointOnEdge);
    const projection = getScalarProduct(cornerAndPointDiff, dir);
    if (projection > 0 && projection > supportPointDistance) {
      supportPointDistance = projection;
      supportPointX = corner.x;
      supportPointY = corner.y;
    }
  }

  if (supportPointX === null) {
    return null;
  }

  return {
    supportPointX,
    supportPointY,
    supportPointDistance,
  };
};
