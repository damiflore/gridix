import { drawRectangle } from "src/draw/draw.js"
import { centerXFromCellX, centerYFromCellY } from "src/geometry/grid.js"
import { createRectangle } from "src/geometry/rectangle.js"

export const createIce = ({ cellX, cellY, worldGrid }) => {
  const rectangle = createRectangle({
    centerX: centerXFromCellX(cellX, worldGrid),
    centerY: centerYFromCellY(cellY, worldGrid),
    width: worldGrid.cellSize,
    height: worldGrid.cellSize,
  })

  const ice = {
    ...rectangle,
    name: "ice",
    onCellMateJoin: (gameObject) => {
      gameObject.flagIce = true
    },
    onCellMateLeave: (gameObject) => {
      gameObject.flagIce = false
    },
    draw: drawRectangle,
    fillStyle: "lightblue",
  }

  return ice
}
