import {
  Arcade,
  CanvasDriver,
  Engine,
  Input,
  StageScaleMode,
} from "black-engine";
import { Game } from "./game.js";

// Game will be our starting class and rendering will be done on Canvas
const engine = new Engine("container", Game, CanvasDriver, [Arcade, Input]);

// Pause simulation when container loses focus
engine.pauseOnBlur = false;

// Pause simulation when page is getting hidden
engine.pauseOnHide = false;

// Wroom, wroom!
engine.start();

engine.stage.setSize(100, 200);

// Makes stage always centered
engine.stage.scaleMode = StageScaleMode.FIXED;
