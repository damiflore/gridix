export const blocUpdateAcceleration = {
  acceleration: ({ accelerationX, accelerationY }, { msEllapsed }) => {
    const secondsEllapsed = msEllapsed / 1000

    return {
      velocityX: accelerationX * secondsEllapsed,
      velocityY: accelerationY * secondsEllapsed,
    }
  },
}

// https://codepen.io/OliverBalfour/post/implementing-velocity-acceleration-and-friction-on-a-canvas
export const blocUpdateFriction = {
  friction: ({ velocityX, velocityY, friction, frictionAmbient }) => {
    const frictionCoef = 1 - friction
    const frictionAmbientCoef = 1 - frictionAmbient
    const frictionTotal = frictionCoef + frictionAmbientCoef
    return {
      velocityX: Math.round(velocityX * frictionTotal),
      velocityY: Math.round(velocityY * frictionTotal),
    }
  },
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

export const blocUpdateVelocity = {
  velocity: ({ velocityX, velocityY, positionX, positionY }, { msEllapsed }) => {
    const secondsEllapsed = msEllapsed / 1000

    return {
      positionX: Math.round(positionX + velocityX * secondsEllapsed),
      positionY: Math.round(positionY + velocityY * secondsEllapsed),
    }
  },
}
