import { getScalarProduct } from "../geometry/vector.js";
import { testBoundingBoxContact } from "./boundingBox.js";
import { getCollisionInfoForCircleToCircle } from "./circleToCircle.js";
import { getCollisionInfoForRectangleToCircle } from "./rectangleToCircle.js";
import { getCollisionInfoForRectangleToRectangle } from "./rectangleToRectangle.js";

export const getCollisionInfo = (gameObject, otherGameObject) => {
  const boundingBoxContact = testBoundingBoxContact(
    gameObject,
    otherGameObject,
  );
  if (!boundingBoxContact) {
    return null;
  }

  const collisionInfo = getRawCollisionInfo(gameObject, otherGameObject);
  if (!collisionInfo) {
    return null;
  }

  const collisionNormal = {
    x: collisionInfo.collisionNormalX,
    y: collisionInfo.collisionNormalY,
  };
  const centerDiff = {
    x: otherGameObject.centerX - gameObject.centerX,
    y: otherGameObject.centerY - gameObject.centerY,
  };

  if (getScalarProduct(collisionNormal, centerDiff) < 0) {
    return reverseCollisionInfo(collisionInfo);
  }

  return collisionInfo;
};

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

const reverseCollisionInfo = ({
  collisionDepth,
  collisionNormalX,
  collisionNormalY,
  collisionStartX,
  collisionStartY,
  collisionEndX,
  collisionEndY,
}) => {
  return {
    collisionDepth,
    collisionNormalX: collisionNormalX * -1,
    collisionNormalY: collisionNormalY * -1,
    collisionStartX: collisionEndX,
    collisionStartY: collisionEndY,
    collisionEndX: collisionStartX,
    collisionEndY: collisionStartY,
  };
};

const getRawCollisionInfo = (gameObject, otherGameObject) => {
  const shape = gameObject.shape;
  const otherShape = otherGameObject.shape;

  if (shape === "circle" && otherShape === "circle") {
    return getCollisionInfoForCircleToCircle(gameObject, otherGameObject);
  }

  if (shape === "rectangle" && otherShape === "rectangle") {
    return getCollisionInfoForRectangleToRectangle(gameObject, otherGameObject);
  }

  if (shape === "rectangle" && otherShape === "circle") {
    return getCollisionInfoForRectangleToCircle(gameObject, otherGameObject);
  }
  if (shape === "circle" && otherShape === "rectangle") {
    return getCollisionInfoForRectangleToCircle(otherGameObject, gameObject);
  }

  return null;
};
