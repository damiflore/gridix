import { Graphics, RigidBody, BoxCollider, ColorHelper, RGB } from "black-engine"

export const createHero = ({ x = 0, y = 0 } = {}) => {
  const width = 32
  const height = 32
  const gameObject = new Graphics()

  gameObject.x = x
  gameObject.y = y

  gameObject.onUpdate = () => {
    gameObject.beginPath()
    gameObject.rect(gameObject.x, (gameObject.y = y), width, height)
    gameObject.closePath()
    gameObject.fillStyle(redHex)
    gameObject.fill()
  }

  const body = new RigidBody()
  const boxCollider = new BoxCollider(0, 0, width, height)
  gameObject.addComponent(body)
  gameObject.addComponent(boxCollider)

  return gameObject
}

const redRGB = new RGB(255, 0, 0)
const redHex = ColorHelper.rgb2hex(redRGB)
