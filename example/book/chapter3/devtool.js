const devtool = document.querySelector("#devtool")

export const updateDevtool = ({ gameObjects, gameObjectSelectedIndex }) => {
  const gameObjectSelected =
    gameObjectSelectedIndex === -1 ? null : gameObjects[gameObjectSelectedIndex]

  const gameObjectLengthNode = document.querySelector("#game-objects-length")
  gameObjectLengthNode.innerHTML = gameObjects.length

  const gameObjectSelectedIdNode = document.querySelector("#game-object-selected-id")
  gameObjectSelectedIdNode.innerHTML = gameObjectSelectedIndex

  const gameObjectSelectedCenterNode = document.querySelector("#game-object-selected-center")
  gameObjectSelectedCenterNode.innerHTML = gameObjectSelected
    ? `${gameObjectSelected.centerX.toPrecision(3)},${gameObjectSelected.centerY.toPrecision(3)}`
    : ""

  const gameObjectSelectedAngleNode = document.querySelector("#game-object-selected-angle")
  gameObjectSelectedAngleNode.innerHTML = gameObjectSelected
    ? gameObjectSelected.angle.toPrecision(3)
    : ""

  const buttonReset = devtool.querySelector('[name="reset"]')
  buttonReset.onclick = () => {
    gameObjects.splice(5, gameObjects.length)
    gameObjectSelectedIndex = -1
  }
}
