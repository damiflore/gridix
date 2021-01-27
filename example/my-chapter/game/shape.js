import { drawRectangle, drawCircle } from "../draw/draw.js"
import { RigidBody } from "../physic/rigid-body.js"
import { GameObject } from "./gameObject.js"

export const createCircle = ({ rigid = false, ...rest } = {}) => {
  return {
    ...CIRCLE_PROPS,
    ...(rigid ? RigidBody : {}),
    ...rest,
  }
}
const CIRCLE_PROPS = {
  ...GameObject,
  shape: "circle",
  updateDraw: drawCircle,
  radius: 0,
  rigid: false,
}

export const createRectangle = ({ rigid = false, ...rest } = {}) => {
  return {
    ...RECTANGLE_PROPS,
    ...(rigid ? RigidBody : {}),
    ...rest,
  }
}
const RECTANGLE_PROPS = {
  ...GameObject,
  shape: "rectangle",
  updateDraw: drawRectangle,
  width: 0,
  height: 0,
  rigid: false,
}