import React from "react"
import ReactDOM from "react-dom"

const App = () => {
  return <Graph width={200} height={200} values={[10, 20, 30, 1, 4, 12, 23]} />
}

// https://blacksmith2d.io/Docs/Examples/Basics/Pivots-and-Anchors?fullscreen=true
// https://blacksmith2d.io/scripts/stats.js
const Graph = ({ values, width, height }) => {
  const canvasRef = React.useRef()

  const maxPoints = 10
  const widthPerPoint = width / maxPoints
  const circleRadius = 1

  React.useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas.getContext("2d")
    const info = getInfo(values)

    const valueMin = info.lowest
    const valueMax = info.highest

    let x = 0

    const circles = []

    values.forEach((value) => {
      x += widthPerPoint / 2
      const yRatio = value / valueMax
      const y = height * (1 - yRatio)

      console.log(x, y)

      // context.save()
      context.beginPath()
      circles.push({ x, y, radius: circleRadius })
      context.arc(x, y, circleRadius, 0, 2 * Math.PI)
      context.closePath()
      context.fillStyle = "blue"
      context.fill()
      // context.restore()
    })

    context.beginPath()
    // context.moveTo(circles[0].x, circles[0].y)
    circles.forEach((circle) => {
      context.lineTo(circle.x, circle.y)
      context.lineWidth = 2
      context.lineCap = "round"
      context.strokeStyle = "blue"
      context.stroke()
    })
    context.closePath()
  }, [values])

  return (
    <canvas
      // onMouseOver={(mouseoverEvent) => {}}
      ref={canvasRef}
      width={width}
      height={height}
    ></canvas>
  )
}

const getInfo = (values) => {
  if (values.length === 0) {
    return {
      lowest: -1,
      highest: 1,
    }
  }

  if (values.length === 0) {
    return {
      lowest: values[0],
      highest: values[0],
    }
  }

  let lowest = Infinity
  let highest = -Infinity
  values.forEach((value) => {
    if (value < lowest) lowest = value
    if (value > highest) highest = value
  })

  return {
    lowest,
    highest,
  }
}

ReactDOM.render(<App />, document.querySelector("#app"))
