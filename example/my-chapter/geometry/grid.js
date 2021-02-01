// https://github.com/MassiveHeights/Black-Donuts/blob/f8aab3baba364b7f1d5e71f177639086299acb52/js/objects/board.js#L180
export const closestCellCenterFromPoint = ({ x, y }, { cellSize }) => {
  const closestColumn = Math.floor(x / cellSize)
  const closestRow = Math.floor(y / cellSize)

  return {
    x: closestColumn * cellSize + cellSize / 2,
    y: closestRow * cellSize + cellSize / 2,
  }
}

export const centerXFromCell = ({ cellX, cellSize }) => {
  return cellX * cellSize + cellSize / 2
}

export const centerYFromCell = ({ cellY, cellSize }) => {
  return cellY * cellSize + cellSize / 2
}

export const centerPointFromCell = ({ cellX, cellY, cellSize }) => {
  return {
    centerX: centerXFromCell({ cellX, cellSize }),
    centerY: centerYFromCell({ cellY, cellSize }),
  }
}
