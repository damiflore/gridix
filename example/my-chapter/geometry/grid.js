// https://github.com/MassiveHeights/Black-Donuts/blob/f8aab3baba364b7f1d5e71f177639086299acb52/js/objects/board.js#L180
export const closestCellCenterFromPoint = ({ x, y }, { cellSize }) => {
  const closestColumn = Math.floor(x / cellSize)
  const closestRow = Math.floor(y / cellSize)
  const closestCellCenter = {
    x: closestColumn * cellSize + cellSize / 2,
    y: closestRow * cellSize + cellSize / 2,
  }

  return closestCellCenter
}

export const centerXFromCellX = (cellX, { cellSize }) => {
  const centerX = cellX * cellSize + cellSize / 2

  return centerX
}

export const centerYFromCellY = (cellY, { cellSize }) => {
  const centerY = cellY * cellSize + cellSize / 2

  return centerY
}

export const centerPointFromCell = ({ cellX, cellY }, grid) => {
  const centerPoint = {
    centerX: centerXFromCellX(cellX, grid),
    centerY: centerYFromCellY(cellY, grid),
  }

  return centerPoint
}

export const cellXFromCellIndex = (cellIndex, { cellXCount }) => {
  const cellX = cellIndex % cellXCount

  return cellX
}

export const cellYFromCellIndex = (cellIndex, { cellXCount }) => {
  const cellY = Math.floor(cellIndex / cellXCount)

  return cellY
}

export const cellIndexFromCell = ({ cellX, cellY }, { cellXCount }) => {
  const cellIndex = cellX + cellY * cellXCount

  return cellIndex
}
