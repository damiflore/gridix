export const Bloc = {
  name: "anonymous",
  update: () => {},
  effect: () => {},
  draw: () => {},

  // position
  positionX: 0,
  positionY: 0,
  zIndex: 0,

  // dimension
  width: 0,
  height: 0,

  // physic
  blocCollidingArray: [],
  canCollide: false,
  accelerationX: 0,
  accelerationY: 0,
  // https://github.com/MassiveHeights/Black/blob/e4967f19cbdfe42b3612981c810ac499ad34b154/src/physics/arcade/Arcade.js#L587
  // forceX,
  // forceY,
  // mais on dirait juste une accélération
  // qui est reset a chaque fois qu'elle est appliquée
  velocityX: 0,
  velocityY: 0,
  friction: 0.01,
  frictionAmbient: 0.05,
  restitution: 1,
  mass: 1,

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
