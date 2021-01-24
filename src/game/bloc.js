export const Bloc = {
  name: "anonymous",
  update: () => {},
  draw: () => {},

  // x and y position
  // ideally it should be in meter, for now it's in pixels
  positionX: 0,
  positionY: 0,

  zIndex: 0,

  // dimension
  // ideally should be in meter, for now it's pixels
  width: 0,
  height: 0,

  // mass in kg
  mass: 0,

  // 1 newton is the number capable to give to 1kg mass an acceleration of 1 meter per second squared
  // 1 newton = 1kg * 1 meter / seconds * seconds
  // N = kg * m / s * s
  // m/s =
  // 1 m/s*2 means in 1s, speed increase of 1 meter
  // ideally forceX should be in newton
  forceX: 0,
  forceY: 0,

  // not used for now
  accelerationX: 0,
  accelerationY: 0,

  // friction coefficient decreasing the impact of forces on velocity
  // 0 means forces are not modified (object move freely and don't slow down or speed up)
  // 0.5 means half of the forces are lost in friction (object move is slowed by 50%)
  // 1 means all forces are lost in friction (object cannot move)
  frictionAmbient: 0.02,

  // the speed in X/Y, for now it's pixel, should be converted to m/s
  velocityX: 0,
  velocityY: 0,

  // a coefficient altering collision impact resolution between 0 and 1
  // 0 means object loose all velocity on collision (stays where collision occured)
  // 0.5 means object loose half its velocity on collision
  // 1 means object loose zero velocity on collision
  restitution: 1,

  // not used yet, would alter the collision impact resolution on velocity and position
  // is it an other word for restitution ?
  friction: 0.01,

  canCollide: false,
  blocCollidingArray: [],

  // styles
  fillStyle: undefined,
  strokeStyle: undefined,
  alpha: 1,
  image: undefined,
  imageSourceX: undefined,
  imageSourceY: undefined,
}

export const mutateBloc = (bloc, mutations) => {
  if (mutations) {
    Object.assign(bloc, mutations)
  }
}
