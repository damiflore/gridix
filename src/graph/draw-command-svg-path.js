export const svgPathCommandFromDrawCommands = (commands) => {
  return commands.map((command) => svgPathCommandFromCommand(command)).join(" ")
}

const svgPathCommandFromCommand = (command) => {
  return svgPathCommandMappings[command.type](command)
}

const svgPathCommandMappings = {
  moveTo: ({ x, y }) => `M ${x} ${y}`,
  lineTo: ({ x, y }) => `L ${x} ${y}`,
  quadraticCurveTo: ({ controlPointX, controlPointY, endPointX, endPointY }) =>
    `Q ${controlPointX} ${controlPointY} ${endPointX} ${endPointY}`,
}
