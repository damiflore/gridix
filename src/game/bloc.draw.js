export const blocDrawRectangle = (bloc, context) => {
  context.beginPath()
  context.rect(bloc.positionX, bloc.positionY, bloc.width, bloc.height)
  context.closePath()

  applyStyle(context, bloc)
}

const applyStyle = (
  context,
  {
    opacity,
    fillStyle,
    strokeStyle,
    image,
    imageSourceX,
    imageSourceY,
    positionX,
    positionY,
    width,
    height,
  },
) => {
  context.globalAlpha = opacity
  if (fillStyle) {
    context.fillStyle = fillStyle
    context.fill()
  }
  if (strokeStyle) {
    context.strokeStyle = strokeStyle
    context.stroke()
  }
  if (image) {
    // so that the image is constrained with the current path
    // (for instance a circle)
    context.clip()
    context.drawImage(
      image,
      imageSourceX,
      imageSourceY,
      width,
      height,
      positionX,
      positionY,
      width,
      height,
    )
  }
  context.restore()
}

export const blocDrawCircle = (bloc, context) => {
  context.beginPath()
  context.arc(
    bloc.positionX + bloc.width / 2,
    bloc.positionY + bloc.height / 2,
    bloc.width / 2,
    0,
    2 * Math.PI,
  )
  context.closePath()

  applyStyle(context, bloc)
}
