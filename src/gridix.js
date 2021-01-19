// https://github.com/dmail-front/autotile

/*

partons sur un truc méga simple niveau map genre du niveau de
Mystic quest legend (https://www.youtube.com/watch?v=Qlzd_fzUCdA)
qui au final se jouait tres bien malgré un system de carte et déplacement
simplissime

- context api: https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D
https://github.com/ovalia/ovalia/blob/master/html/game.html

*/

const CELL_SIZE = 32

const createUnit = ({ x, y, z = 0, solid = false, ...rest }) => {
  return {
    x,
    y,
    z,
    solid,
    ...rest,
  }
}

const createFloor = (props) => {
  return {
    solid: false,
    width: CELL_SIZE,
    height: CELL_SIZE,
    color: "white",
    draw: unitDrawAsRectangle,
    ...props,
  }
}

const createWall = (props) => {
  return createUnit({
    solid: true,
    width: CELL_SIZE,
    height: CELL_SIZE,
    color: "black",
    draw: unitDrawAsRectangle,
    ...props,
  })
}

const unitDrawAsRectangle = (unit, context) => {
  drawRectangle(context, {
    x: unit.x,
    y: unit.y,
    width: unit.width,
    height: unit.height,
    fillStyle: unit.color,
  })
}

const drawRectangle = (context, { fillStyle = "green", x, y, width, height }) => {
  context.save()
  context.fillStyle = fillStyle
  context.fillRect(x, y, width, height)
  context.restore()
}

const unitDrawAsCircle = (unit, context) => {
  drawCircle(context, {
    x: unit.x + unit.width / 2,
    y: unit.y + unit.height / 2,
    radius: unit.radius,
  })
}

const drawCircle = (context, { fillStyle = "red", x, y, radius }) => {
  context.save()
  context.fillStyle = fillStyle
  context.beginPath()
  context.arc(x, y, radius, 0, 2 * Math.PI)
  context.stroke()
  context.fill()
  context.closePath()
  context.restore()
}

const hero = createUnit({
  x: 0,
  y: 0,
  width: 32,
  height: 32,
  draw: (unit, context) => unitDrawAsCircle({ ...unit, radius: 12 }, context),
})

const units = [
  createFloor({ x: 0, y: 0 }),
  createWall({ x: 32, y: 0 }),
  createWall({ x: 64, y: 0 }),
  createFloor({ x: 0, y: 32 }),
  createWall({ x: 32, y: 32 }),
  createFloor({ x: 64, y: 32 }),
  createFloor({ x: 0, y: 64 }),
  createFloor({ x: 32, y: 64 }),
  createFloor({ x: 64, y: 64 }),
  hero,
]

const createMap = ({ rowCount = 3, columnCount = 3 } = {}) => {
  const canvas = createCanvas({
    width: CELL_SIZE * columnCount,
    height: CELL_SIZE * rowCount,
  })

  return canvas
}

const render = (canvas) => {
  const context = canvas.getContext("2d")

  units.forEach((unit) => {
    unit.draw(unit, context)
  })
}

const createCanvas = ({ width, height }) => {
  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height
  return canvas
}

const canvas = createMap()
setTimeout(() => {
  document.body.appendChild(canvas)
  render(canvas)
}, 200)
