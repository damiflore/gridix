const pixelRatio = Math.round(window.devicePixelRatio || 1)

export const createPanel = ({
  fg = "#0f0",
  bg = "#020",
  text = "untitled",
  min = Infinity,
  max = 0,
  width = 80,
  height = 48,
  textPadding = 2,
  textFontSize = 9,
  graphPadding = 3,
} = {}) => {
  const canvas = document.createElement("canvas")

  const textPaddingPixels = textPadding * pixelRatio
  const graphPaddingPixels = graphPadding * pixelRatio
  const widthPixels = width * pixelRatio
  const heightPixels = height * pixelRatio

  const textX = textPaddingPixels
  const textY = textPaddingPixels
  const textHeightPixels = textFontSize * pixelRatio
  const textBottom = textY + textHeightPixels
  const graphX = graphPaddingPixels
  const graphWidth = widthPixels - graphPaddingPixels * 2
  const graphY = textBottom + graphPaddingPixels
  const graphHeight = heightPixels - graphY - graphPaddingPixels

  canvas.width = widthPixels
  canvas.height = heightPixels
  canvas.style.cssText = `width:${width}px;height:${height}px`

  var context = canvas.getContext("2d")
  context.font = `bold ${textHeightPixels}px Helvetica,Arial,sans-serif`
  context.textBaseline = "top"

  context.fillStyle = bg
  context.fillRect(0, 0, widthPixels, heightPixels)

  context.fillStyle = fg
  context.fillText(text, textX, textY)
  context.fillRect(graphX, graphY, graphWidth, graphHeight)

  context.fillStyle = bg
  context.globalAlpha = 0.9
  context.fillRect(graphX, graphY, graphWidth, graphHeight)

  const update = (value, maxValue) => {
    min = Math.min(min, value)
    max = Math.max(max, value)

    context.fillStyle = bg
    context.globalAlpha = 1
    context.fillRect(0, 0, widthPixels, graphY)
    context.fillStyle = fg
    context.fillText(
      `${Math.round(value)} ${text} (${Math.round(min)}-${Math.round(max)})`,
      textX,
      textY,
    )

    context.drawImage(
      canvas,
      graphX + pixelRatio,
      graphY,
      graphWidth - pixelRatio,
      graphHeight,
      graphX,
      graphY,
      graphWidth - pixelRatio,
      graphHeight,
    )

    context.fillRect(graphX + graphWidth - pixelRatio, graphY, pixelRatio, graphHeight)

    context.fillStyle = bg
    context.globalAlpha = 0.9
    context.fillRect(
      graphX + graphWidth - pixelRatio,
      graphY,
      pixelRatio,
      Math.round((1 - value / maxValue) * graphHeight),
    )
  }

  return {
    canvas,
    update,
  }
}
