export const blocUpdateVelocity = {
  velocity: ({ velocityX, velocityY, positionX, positionY }, { msEllapsed }) => {
    return {
      positionX: velocityX ? positionX + velocityX * (msEllapsed / 1000) : positionX,
      positionY: velocityY ? positionY + velocityY * (msEllapsed / 1000) : positionY,
    }
  },
}
