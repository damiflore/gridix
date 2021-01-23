import { mutateBloc } from "./bloc.js"

export const applyMove = (bloc, { msEllapsed }) => {
  applyAcceleration(bloc, { msEllapsed })
  applyFrictionAmbient(bloc, { msEllapsed })
  applyVelocity(bloc, { msEllapsed })
}

// https://codepen.io/OliverBalfour/post/implementing-velocity-acceleration-and-friction-on-a-canvas
// https://github.com/MassiveHeights/Black/blob/e4967f19cbdfe42b3612981c810ac499ad34b154/src/physics/arcade/Arcade.js#L587
const applyAcceleration = (bloc, { msEllapsed }) => {
  const { velocityX, velocityY, accelerationX, accelerationY } = bloc
  const secondsEllapsed = msEllapsed / 1000

  mutateBloc(bloc, {
    velocityX: velocityX + accelerationX * secondsEllapsed,
    velocityY: velocityY + accelerationY * secondsEllapsed,
  })
}

// https://codepen.io/OliverBalfour/post/implementing-velocity-acceleration-and-friction-on-a-canvas
const applyFrictionAmbient = (bloc) => {
  const { velocityX, velocityY, frictionAmbient } = bloc
  const frictionAmbientCoef = 1 - frictionAmbient

  mutateBloc(bloc, {
    velocityX: Math.round(velocityX * frictionAmbientCoef),
    velocityY: Math.round(velocityY * frictionAmbientCoef),
  })
}

const applyVelocity = (bloc, { msEllapsed }) => {
  const { velocityX, velocityY, positionX, positionY } = bloc
  const secondsEllapsed = msEllapsed / 1000

  mutateBloc(bloc, {
    positionX: Math.round(positionX + velocityX * secondsEllapsed),
    positionY: Math.round(positionY + velocityY * secondsEllapsed),
  })
}

// export const blocUpdateFriction = {
//   friction: ({ velocityX, velocityY, friction }) => {
//     let speed = Math.sqrt(velocityX * velocityX + velocityY * velocityY)
//     const angle = Math.atan2(velocityY, velocityX)
//     if (speed > friction) {
//       speed -= friction
//     } else {
//       speed = 0
//     }
//     return {
//       velocityX: Math.cos(angle) * speed,
//       velocityY: Math.sin(angle) * speed,
//     }
//   },
// }
