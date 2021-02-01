// https://github.com/MassiveHeights/Black-Donuts/blob/f8aab3baba364b7f1d5e71f177639086299acb52/js/objects/board.js#L180
export const closestCellCenterFromPoint = ({ x, y }, { cellSize }) => {
  const closestColumn = Math.floor(x / cellSize)
  const closestRow = Math.floor(y / cellSize)

  return {
    x: closestColumn * cellSize + cellSize / 2,
    y: closestRow * cellSize + cellSize / 2,
  }
}

export const centerXFromCellX = (cellX, cellSize) => {
  return cellX * cellSize + cellSize / 2
}

export const centerYFromCellY = (cellY, cellSize) => {
  return cellY * cellSize + cellSize / 2
}

export const centerPointFromCell = ({ cellX, cellY, cellSize }) => {
  return {
    centerX: centerXFromCellX(cellX, cellSize),
    centerY: centerYFromCellY(cellY, cellSize),
  }
}

export const cellXFromCellIndex = (cellIndex, world) => {
  const cellXMax = world.width / world.cellSize
  return cellIndex % cellXMax
}

export const cellYFromCellIndex = (cellIndex, world) => {
  const cellXMax = world.width / world.cellSize
  return Math.floor(cellIndex / cellXMax)
}

export const cellIndexFromCell = ({ cellX, cellY }, world) => {
  const cellXMax = world.width / world.cellSize
  const indexX = cellX
  const indexY = cellY * cellXMax
  return indexX + indexY
}
