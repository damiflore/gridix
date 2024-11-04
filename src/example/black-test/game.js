import { Arcade, AssetManager, Black, GameObject, Key } from "black-engine";
import { createBaril, createHero } from "./hero.js";

export class Game extends GameObject {
  constructor() {
    super();

    // Pick default AssetManager
    const assets = new AssetManager();
    // Listen for a complete message
    assets.on("complete", () => {
      setTimeout(() => {
        this.onAssetsLoadded();
      });
    });

    // Start preloading all enqueued assets
    assets.loadQueue();
  }

  onAssetsLoadded() {
    const arcade = Black.engine.getSystem(Arcade);
    arcade.gravityX = 0;
    arcade.gravityY = 0;
    arcade.boundsEnabled = true;
    arcade.iterations = 1;

    this.stage.on("resize", this.onResize, this);

    this.controls = { up: false, left: false, right: false, down: false };

    Black.input.on("keyPress", (msg, keyInfo) =>
      this.onKeyEvent(keyInfo.keyCode, true),
    );
    Black.input.on("keyUp", (msg, keyInfo) =>
      this.onKeyEvent(keyInfo.keyCode, false),
    );

    setupForHeroMovingOneBarilBlockedByWorld(this);
  }

  onKeyEvent(code, enable) {
    if (code === Key.DOWN_ARROW) {
      this.controls.down = enable;
      return;
    }

    if (code === Key.UP_ARROW) {
      this.controls.up = enable;
      return;
    }

    if (code === Key.LEFT_ARROW) {
      this.controls.left = enable;
      return;
    }

    if (code === Key.RIGHT_ARROW) {
      this.controls.right = enable;
      return;
    }
  }

  onUpdate() {
    if (!this.controls) return;

    const { controls, hero } = this;
    if (controls.right) {
      hero.rigidBody.forceX = 400;
    } else if (controls.left) {
      hero.rigidBody.forceX = -400;
    }
    if (controls.down) {
      hero.rigidBody.forceY = 400;
    } else if (controls.up) {
      hero.rigidBody.forceY = -400;
    }
  }

  onResize() {}
}

const setupForHeroMovingOneBarilBlockedByWorld = (game) => {
  const hero = createHero({
    x: 0,
    y: 0,
    width: 50,
    height: 50,
  });
  game.add(hero);

  const baril = createBaril({
    x: 50,
    y: 0,
    width: 50,
    height: 50,
  });
  game.add(baril);

  game.hero = hero;
};

// const setupForHeroMovingTwoBarilBlockedByWorld = (game) => {
//   const hero = createHero()
//   game.add(hero)

//   const baril = createBaril({ x: 50, y: 0 })
//   game.add(baril)

//   const baril2 = createBaril({ x: 100, y: 0 })
//   game.add(baril2)

//   game.hero = hero
// }
