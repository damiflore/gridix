// later we will accept only a force
// and depending on the rotation we will know which direction the force apply

import { centerXFromCellX, centerYFromCellY } from "src/geometry/grid.js"
import { createRectangle } from "src/geometry/rectangle.js"
import { addForce } from "src/physic/physic.motion.js"
import { drawRectangle } from "src/draw/draw.js"

export const createSideWalk = ({ cellX, cellY, worldGrid, force = -6000 }) => {
  const rectangle = createRectangle({
    centerX: centerXFromCellX(cellX, worldGrid),
    centerY: centerYFromCellY(cellY, worldGrid),
    width: worldGrid.cellSize,
    height: worldGrid.cellSize,
  })

  const sidewalk = {
    ...rectangle,
    name: "sidewalk",
    update: () => {
      const cellContent = worldGrid.cells[sidewalk.cellIndex]
      cellContent.forEach((cellMate) => {
        if (cellMate !== sidewalk) {
          addForce(cellMate, { y: force, origin: sidewalk })
        }
      })
    },
    draw: drawRectangle,
    fillStyle: "lightgreen",
  }

  return sidewalk
}
