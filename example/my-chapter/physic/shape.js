import { RigidBody } from "./rigid-body.js"
import { drawCircle, drawRectangle } from "../draw/draw.js"

export const createRigidCircle = ({ centerX, centerY, radius, ...props }) => {
  return {
    ...RigidBody,
    shape: "circle",
    updateDraw: drawCircle,
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
    updateDraw: drawRectangle,
    centerX,
    centerY,
    width,
    height,
    ...props,
  }
}
