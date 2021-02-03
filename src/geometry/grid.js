// https://github.com/MassiveHeights/Black-Donuts/blob/f8aab3baba364b7f1d5e71f177639086299acb52/js/objects/board.js#L180

export const closestCellIndexFromPoint = ({ x, y }, { cellSize, cellXCount, cellYCount }) => {
  if (x < 0) {
    return -1
  }
  const closestCellXFloat = x / cellSize
  if (closestCellXFloat > cellXCount) {
    return -1
  }

  if (y < 0) {
    return -1
  }
  const closestCellYFloat = y / cellSize
  if (closestCellYFloat > cellYCount) {
    return -1
  }

  const closestCellX = Math.floor(closestCellXFloat)
  const closestCellY = Math.floor(closestCellYFloat)
  const closestCellIndex = cellIndexFromCell(
    {
      cellX: closestCellX,
      cellY: closestCellY,
    },
    { cellXCount },
  )
  return closestCellIndex
}

export const closestCellCenterFromPoint = ({ x, y }, { cellSize }) => {
  const closestCellX = Math.floor(x / cellSize)
  const closestCellY = Math.floor(y / cellSize)

  const closestCellCenter = {
    x: closestCellX * cellSize + cellSize / 2,
    y: closestCellY * cellSize + cellSize / 2,
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

export const getLastCellIndex = ({ cellXCount, cellYCount }) => {
  const cellCount = cellYCount * cellXCount
  const lastCellIndex = cellCount - 1

  return lastCellIndex
}

export const generateCells = (grid, fillWith) => {
  const lastCellIndex = getLastCellIndex(grid)
  const cellCount = lastCellIndex + 1
  const cells = new Array(cellCount)

  if (fillWith !== undefined) {
    let i = cellCount
    while (i--) {
      cells[i] = fillWith
    }
  }

  return cells
}
