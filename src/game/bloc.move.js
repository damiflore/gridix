export const applyMove = (bloc, { msEllapsed }) => {
  return {
    ...applyAcceleration(bloc, { msEllapsed }),
    ...applyFriction(bloc, { msEllapsed }),
    ...applyVelocity(bloc, { msEllapsed }),
  }
}

const applyAcceleration = ({ accelerationX, accelerationY }, { msEllapsed }) => {
  const secondsEllapsed = msEllapsed / 1000

  return {
    velocityX: accelerationX * secondsEllapsed,
    velocityY: accelerationY * secondsEllapsed,
  }
}

// https://codepen.io/OliverBalfour/post/implementing-velocity-acceleration-and-friction-on-a-canvas
const applyFriction = ({ velocityX, velocityY, friction, frictionAmbient }) => {
  const frictionCoef = 1 - friction
  const frictionAmbientCoef = 1 - frictionAmbient
  const frictionTotal = frictionCoef + frictionAmbientCoef

  return {
    velocityX: Math.round(velocityX * frictionTotal),
    velocityY: Math.round(velocityY * frictionTotal),
  }
}

const applyVelocity = ({ velocityX, velocityY, positionX, positionY }, { msEllapsed }) => {
  const secondsEllapsed = msEllapsed / 1000

  return {
    positionX: Math.round(positionX + velocityX * secondsEllapsed),
    positionY: Math.round(positionY + velocityY * secondsEllapsed),
  }
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
