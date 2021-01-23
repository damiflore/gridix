import { AssetManager, Arcade, Black, GameObject, Key } from "black-engine"
import { createHero } from "./hero.js"

export class Game extends GameObject {
  constructor() {
    super()

    // Pick default AssetManager
    const assets = new AssetManager()
    // Listen for a complete message
    assets.on("complete", () => {
      setTimeout(() => {
        this.onAssetsLoadded()
      })
    })

    // Start preloading all enqueued assets
    assets.loadQueue()
  }

  onAssetsLoadded() {
    const arcade = Black.engine.getSystem(Arcade)
    arcade.gravityX = 0
    arcade.gravityY = 0

    this.stage.on("resize", this.onResize, this)

    this.controls = { up: false, left: false, right: false, down: false }

    Black.input.on("keyPress", (msg, keyInfo) => this.onKeyEvent(keyInfo.keyCode, true))
    Black.input.on("keyUp", (msg, keyInfo) => this.onKeyEvent(keyInfo.keyCode, false))

    this.hero = createHero()
    this.add(this.hero)
  }

  onKeyEvent(code, enable) {
    if (code === Key.DOWN_ARROW) {
      this.controls.down = enable
      return
    }

    if (code === Key.UP_ARROW) {
      this.controls.up = enable
      return
    }

    if (code === Key.LEFT_ARROW) {
      this.controls.left = enable
      return
    }

    if (code === Key.RIGHT_ARROW) {
      this.controls.right = enable
      return
    }
  }

  onUpdate() {
    const { controls, hero } = this
    if (controls.right) {
      hero.rigidBody.forceX = 400
    } else if (controls.left) {
      hero.rigidBody.forceX = -400
    }
    if (controls.down) {
      hero.rigidBody.forceY = 400
    } else if (controls.up) {
      hero.rigidBody.forceY = -400
    }
  }

  onResize() {}
}
