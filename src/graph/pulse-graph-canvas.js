import { drawCurve, drawCurveQuadratic } from "./draw-curve.js"

const pixelRatio = Math.round(window.devicePixelRatio || 1)

const maxPrecision = (value, max = 2) => {
  const multiplier = Math.pow(10, max)
  return Math.round(value * multiplier) / multiplier
}

export const createPulseGraph = ({
  fg = "#0f0",
  bg = "#020",
  width = 200,
  height = 100,
  graphPadding = 3,
  lineWidth = 1,
  lineStyle = fg,
  min = -1,
  max = 1,
  maxDynamic = true,
  circleRadius = 2,
  curve = "quadra",
  maxPoints = 100,
  precision = 2,

  legendFontSize = 14,
  valueFontSize = 30,
} = {}) => {
  const canvas = document.createElement("canvas")
  const context = canvas.getContext("2d")

  const widthPixels = width * pixelRatio
  const heightPixels = height * pixelRatio
  canvas.width = widthPixels
  canvas.height = heightPixels
  canvas.style.cssText = `width:${width}px;height:${height}px`

  const legendWidth = 70

  const graphPaddingPixels = graphPadding * pixelRatio
  const graphX = graphPaddingPixels
  const graphWidth = widthPixels - graphPaddingPixels * 2 - legendWidth
  const graphY = graphPaddingPixels
  const graphHeight = heightPixels - graphY - graphPaddingPixels

  context.textBaseline = "top"
  context.fillStyle = bg
  context.globalAlpha = 0.9

  const values = []
  const widthPerPoint = graphWidth / maxPoints

  const update = (value) => {
    if (maxDynamic) {
      if (value < min) {
        min = value
      }
      if (value > max) {
        max = value
      }
    }

    if (values.length === maxPoints) {
      values.shift()
    }
    values.push(value)

    context.clearRect(0, 0, widthPixels, heightPixels)

    context.fillStyle = bg
    context.fillRect(0, 0, widthPixels, heightPixels)

    const legendX = width - legendWidth
    context.fillStyle = fg

    context.font = `bold ${legendFontSize}px Helvetica,Arial,sans-serif`
    context.fillText(maxPrecision(max), legendX + 5, 3, 40)
    context.fillText(maxPrecision(min), legendX + 5, height - legendFontSize - 3, 40)

    context.font = `bold ${valueFontSize}px Helvetica,Arial,sans-serif`
    const valueY = height / 2 - valueFontSize / 2
    const valueDisplayed = maxPrecision(value, precision)
    context.fillText(valueDisplayed, legendX + 5, valueY)
    // https://developer.mozilla.org/en-US/docs/Web/API/TextMetrics
    const valueWidth = context.measureText(valueDisplayed).width

    context.font = `bold ${legendFontSize}px Helvetica,Arial,sans-serif`
    context.fillText("fps", legendX + 5 + valueWidth + 3, valueY + valueFontSize - legendFontSize)

    const circles = []

    const magnitude = Math.abs(min) + Math.abs(max)

    let x = graphX
    context.save()
    values.forEach((value) => {
      const diffWithMax = max - value
      const ratio = diffWithMax / magnitude
      const yRelativeToGraph = graphHeight * ratio
      const y = graphY + yRelativeToGraph

      circles.push({ x, y, radius: circleRadius })

      x += widthPerPoint
    })
    context.restore()

    context.beginPath()
    if (curve === "line") {
      drawCurve(context, circles)
    } else {
      drawCurveQuadratic(context, circles)
    }

    context.save()
    context.lineWidth = lineWidth
    context.lineCap = "round"
    context.strokeStyle = lineStyle
    context.stroke()
    context.restore()

    // circles.forEach((circle) => {
    //   context.beginPath()
    //   context.arc(circle.x, circle.y, circleRadius, 0, 2 * Math.PI)
    //   context.closePath()
    //   // context.save()
    //   context.fillStyle = "blue"
    //   context.fill()
    //   // context.restore()
    // })
  }

  return {
    canvas,
    update,
  }
}
