import { RigidBody } from "./rigid-body.js"

export const createRigidCircle = ({ centerX, centerY, radius, ...props }) => {
  return {
    ...RigidBody,
    shape: "circle",
    centerX,
    centerY,
    radius,
    ...props,
  }
}

export const createRigidRectangle = ({ centerX, centerY, width, height, ...props }) => {
  return {
    ...RigidBody,
    shape: "rectangle",
    centerX,
    centerY,
    width,
    height,
    ...props,
  }
}
