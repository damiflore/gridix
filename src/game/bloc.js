import { blocUpdateVelocity } from "./bloc.updates.js"
import {
  blocEffectCollisionDetection,
  blocEffectCollision,
  blocEffectBounce,
} from "./bloc.effects.js"
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
  canMove: false,
  velocityX: 0,
  velocityY: 0,
  restitution: 1,
  mass: 1,

  // styles
  fillStyle: undefined,
  strokeStyle: undefined,
  opacity: 1,

  updates: {
    ...blocUpdateVelocity,
  },
  effects: {
    ...blocEffectCollisionDetection,
    ...blocEffectBounce,
    ...blocEffectCollision,
  },
  draw: blocDrawRectangle,
}

export const mutateBloc = (bloc, mutations) => {
  Object.assign(bloc, mutations)
}
