import { drawRectangle, drawCircle } from "../draw/draw.js"
import { createRigidBody } from "../physic/rigid-body.js"
import { GameObject } from "./gameObject.js"

export const createCircle = ({ rigid = false, angle = 0, ...rest } = {}) => {
  return {
    ...CIRCLE_PROPS,
    ...(rigid ? createRigidBody() : {}),
    angle,
    ...rest,
  }
}
const CIRCLE_PROPS = {
  ...GameObject,
  shape: "circle",
  draw: drawCircle,
  radius: 0,
  rigid: false,
}

export const createRectangle = ({ rigid = false, angle = 0, ...rest } = {}) => {
  return {
    ...RECTANGLE_PROPS,
    ...(rigid ? createRigidBody() : {}),
    angle,
    ...rest,
  }
}
const RECTANGLE_PROPS = {
  ...GameObject,
  shape: "rectangle",
  draw: drawRectangle,
  width: 0,
  height: 0,
  rigid: false,
}
