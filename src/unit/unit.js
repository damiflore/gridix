export const createUnit = (props) => {
  return props
}

export const drawPathStyle = (context, path, { fillStyle, strokeStyle } = {}) => {
  if (!fillStyle && !strokeStyle) {
    return
  }

  context.save()
  if (fillStyle) {
    context.fillStyle = fillStyle
    context.fill(path)
  }
  if (strokeStyle) {
    context.strokeStyle = strokeStyle
    context.stroke(path)
  }
  context.restore()
}
