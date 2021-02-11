export const drawCurve = (context, points) => {
  context.moveTo(points[0].x, points[0].y)
  points.slice(1).forEach((point) => {
    context.lineTo(point.x, point.y)
  })
}

// this https://medium.com/@francoisromain/smooth-a-svg-path-with-cubic-bezier-curves-e37b49d46c74
// and this https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/bezierCurveTo
// should do the trick too

export const drawCurveQuadratic = (context, points) => {
  if (points.length === 0) {
    return
  }

  if (points.length === 1) {
    context.moveTo(points[0].x, points[0].y)
    context.lineTo(points[0].x, points[0].y)
    return
  }

  if (points.length === 2) {
    context.moveTo(points[0].x, points[0].y)
    context.lineTo(points[1].x, points[1].y)
    return
  }

  secondTry(context, points)
}

// const firstTry = (context, points) => {
//   context.moveTo(points[0].x, points[0].y)
//   let i = 1
//   while (i < points.length - 2) {
//     var xc = (points[i].x + points[i + 1].x) / 2
//     var yc = (points[i].y + points[i + 1].y) / 2
//     context.quadraticCurveTo(points[i].x, points[i].y, xc, yc)
//     i++
//   }
//   context.quadraticCurveTo(points[i].x, points[i].y, points[i + 1].x, points[i + 1].y)
// }

// https://stackoverflow.com/a/40978275
const secondTry = (context, points) => {
  context.moveTo(points[0].x, points[0].y)

  for (var i = 0; i < points.length - 1; i++) {
    var xCenter = (points[i].x + points[i + 1].x) / 2
    var yCenter = (points[i].y + points[i + 1].y) / 2
    var controlPointX = (xCenter + points[i].x) / 2
    var controlPointX2 = (xCenter + points[i + 1].x) / 2
    context.quadraticCurveTo(controlPointX, points[i].y, xCenter, yCenter)
    context.quadraticCurveTo(controlPointX2, points[i + 1].y, points[i + 1].x, points[i + 1].y)
  }
}
