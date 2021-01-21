import { blocDrawRectangle } from "./bloc.draw.js"

export const Bloc = {
  name: "anonymous",

  // position
  positionX: 0,
  positionY: 0,
  positionZ: 0,

  // dimension
  width: 0,
  height: 0,

  // physic
  blocCollidingArray: [],
  canCollide: false,
  accelerationX: 0,
  accelerationY: 0,
  accelerationZ: 0,
  velocityX: 0,
  velocityY: 0,
  velocityZ: 0,
  friction: 0,
  restitution: 1,
  mass: 1,

  // styles
  fillStyle: undefined,
  strokeStyle: undefined,
  alpha: 1,
  image: undefined,
  imageSourceX: undefined,
  imageSourceY: undefined,

  updates: {},
  effects: {},
  draw: blocDrawRectangle,
}

export const mutateBloc = (bloc, mutations) => {
  Object.assign(bloc, mutations)
}
