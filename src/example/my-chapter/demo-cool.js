import { motionAllowedFromMass } from "./physic/physic.motion.js";
import { createCircle, createRectangle } from "./world/shape.js";
import { addBoundsToWorld, createWorld } from "./world/world.js";

export const demoCool = () => {
  const world = createWorld({
    width: 800,
    height: 450,
  });

  addBoundsToWorld(world);

  const gravity = 200;

  world.gravity = true;
  world.addGameObject({
    name: "gravity",
    update: () => {
      if (!world.gravity) {
        return;
      }
      world.forEachGameObject((gameObject) => {
        if (gameObject.rigid && motionAllowedFromMass(gameObject.mass)) {
          gameObject.forces.push({
            y: gravity * gameObject.mass,
          });
        }
      });
    },
  });

  const rectangle = createRectangle({
    strokeStyle: "blue",
    centerX: 500,
    centerY: 200,
    width: 400,
    height: 20,
    mass: 0,
    friction: 0.3,
    restitution: 0,
    angle: 2.8,
    rigid: true,
  });
  world.addGameObject(rectangle);
  world.addGameObject(
    createRectangle({
      strokeStyle: "blue",
      centerX: 200,
      centerY: 400,
      width: 400,
      height: 20,
      mass: 0,
      friction: 1,
      restitution: 0.5,
      rigid: true,
    }),
  );
  world.addGameObject(
    createRectangle({
      strokeStyle: "blue",
      centerX: 100,
      centerY: 200,
      width: 200,
      height: 20,
      mass: 0,
      rigid: true,
    }),
  );
  world.addGameObject(
    createRectangle({
      strokeStyle: "blue",
      centerX: 10,
      centerY: 360,
      width: 20,
      height: 100,
      mass: 0,
      friction: 0,
      restitution: 1,
      rigid: true,
    }),
  );

  let i = 10;
  while (i--) {
    world.addGameObject(
      createRectangle({
        strokeStyle: "blue",
        centerX: Math.random() * world.width,
        centerY: (Math.random() * world.height) / 2,
        width: Math.random() * 50 + 10,
        height: Math.random() * 50 + 10,
        mass: Math.random() * 30,
        friction: Math.random(),
        restitution: Math.random(),
        // restitution: Math.max(Math.random() - 0.5, 0),
        velocityX: Math.random() * 60 - 30,
        velocityY: Math.random() * 60 - 30,
        rigid: true,
      }),
    );
    world.addGameObject(
      createCircle({
        strokeStyle: "blue",
        centerX: Math.random() * world.width,
        centerY: (Math.random() * world.height) / 2,
        radius: Math.random() * 20 + 10,
        mass: Math.random() * 30,
        friction: Math.random(),
        restitution: Math.random(),
        velocityX: Math.random() * 60 - 30,
        velocityY: Math.random() * 60 - 30,
        rigid: true,
      }),
    );
  }

  return world;
};
