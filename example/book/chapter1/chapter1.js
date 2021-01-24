const width = 300
const height = 300
const canvas = document.createElement("canvas")
document.body.appendChild(canvas)

const context = canvas.getContext("2d")
canvas.height = width
canvas.width = height

document.addEventListener("keydown", (keydownEvent) => {
  const { code } = keydownEvent

  if (code === "KeyF") {
    // create new Rectangle at random position
    context.strokeRect(
      Math.random() * width * 0.8,
      Math.random() * height * 0.8,
      Math.random() * 30 + 10,
      Math.random() * 30 + 10,
    )
  }
  if (code === "KeyG") {
    // create new Circle at random position
    context.beginPath()
    // draw a circle
    context.arc(
      Math.random() * width * 0.8,
      Math.random() * height * 0.8,
      Math.random() * 30 + 10,
      0,
      Math.PI * 2,
      true,
    )
    context.closePath()
    context.stroke()
  }
})
