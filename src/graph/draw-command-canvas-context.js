export const applyDrawCommandsToCanvasContext = (commands, context) => {
  commands.forEach((command) => {
    canvasContextCommandMappings[command.type](context, command)
  })
}

const canvasContextCommandMappings = {
  moveTo: (context, { x, y }) => context.moveTo(x, y),
  lineTo: (context, { x, y }) => context.lineTo(x, y),
  quadraticCurveTo: (context, { controlPointX, controlPointY, endPointX, endPointY }) =>
    context.quadraticCurveTo(controlPointX, controlPointY, endPointX, endPointY),
}
