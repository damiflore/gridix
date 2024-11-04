import { getScalarProduct } from "src/geometry/vector.js";
import { testBoundingBoxContact } from "./boundingBox.js";
import { getCollisionInfoForCircleToCircle } from "./circleToCircle.js";
import { getCollisionInfoForRectangleToCircle } from "./rectangleToCircle.js";
import { getCollisionInfoForRectangleToRectangle } from "./rectangleToRectangle.js";

export const getCollisionInfo = (rigidBody, otherRigidBody) => {
  if (
    rigidBody.debugCollisionDetection ||
    otherRigidBody.debugCollisionDetection
  ) {
    rigidBody.debugCollisionDetection = false;
    otherRigidBody.debugCollisionDetection = false;
    // eslint-disable-next-line no-debugger
    debugger;
  }

  const boundingBoxContact = testBoundingBoxContact(rigidBody, otherRigidBody);
  if (!boundingBoxContact) {
    return null;
  }

  const collisionInfo = getRawCollisionInfo(rigidBody, otherRigidBody);
  if (!collisionInfo) {
    return null;
  }

  const collisionNormal = {
    x: collisionInfo.collisionNormalX,
    y: collisionInfo.collisionNormalY,
  };
  const centerDiff = {
    x: otherRigidBody.centerX - rigidBody.centerX,
    y: otherRigidBody.centerY - rigidBody.centerY,
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

const getRawCollisionInfo = (rigidBody, otherRigidBody) => {
  const shapeName = rigidBody.shapeName;
  const otherShapeName = otherRigidBody.shapeName;

  if (shapeName === "circle" && otherShapeName === "circle") {
    return getCollisionInfoForCircleToCircle(rigidBody, otherRigidBody);
  }

  if (shapeName === "rectangle" && otherShapeName === "rectangle") {
    return getCollisionInfoForRectangleToRectangle(rigidBody, otherRigidBody);
  }

  if (shapeName === "rectangle" && otherShapeName === "circle") {
    return getCollisionInfoForRectangleToCircle(rigidBody, otherRigidBody);
  }
  if (shapeName === "circle" && otherShapeName === "rectangle") {
    return getCollisionInfoForRectangleToCircle(otherRigidBody, rigidBody);
  }

  return null;
};
