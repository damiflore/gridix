import { useEffect, useRef, useState } from "preact/hooks";

export const GameObjectInspection = ({ world, gameObjectInspected }) => {
  if (!gameObjectInspected) {
    return "no game object inspected";
  }

  const [updateCount, updateCountSetter] = useState(0);
  useEffect(() => {
    const gameObject = {
      update: () => {
        updateCountSetter((updateCount) => {
          return updateCount + 1;
        });
      },
    };
    world.addGameObject(gameObject);
    return () => {
      world.removeGameObject(gameObject);
    };
  }, []);

  return (
    <>
      <span>name: {gameObjectInspected.name}</span>
      <button
        onClick={() => {
          console.log(gameObjectInspected);
        }}
      >
        Log in console
      </button>
      <ShapeDevtools
        updateCount={updateCount}
        gameObjectInspected={gameObjectInspected}
      />
      <StyleDevtools
        updateCount={updateCount}
        gameObjectInspected={gameObjectInspected}
      />
      <RigidBodyDevtools
        updateCount={updateCount}
        gameObjectInspected={gameObjectInspected}
      />
    </>
  );
};

const ShapeDevtools = ({ updateCount, gameObjectInspected }) => {
  if (gameObjectInspected.shapeName === "rectangle") {
    return (
      <PropertyGroup
        updateCount={updateCount}
        object={gameObjectInspected}
        propertyGroupTitle={"rectangle"}
        propertyGroupNames={RECTANGLE_SHAPE_PROPS}
      />
    );
  }

  if (gameObjectInspected.shapeName === "circle") {
    return (
      <PropertyGroup
        object={gameObjectInspected}
        propertyGroupTitle={"circle"}
        propertyGroupNames={CIRCLE_SHAPE_PROPS}
      />
    );
  }
  return null;
};
const SHAPE_PROPS = ["centerX", "centerY", "angle"];
const RECTANGLE_SHAPE_PROPS = [...SHAPE_PROPS, "width", "height"];
const CIRCLE_SHAPE_PROPS = [...SHAPE_PROPS, "radius"];

const StyleDevtools = ({ gameObjectInspected }) => {
  if (!gameObjectInspected.draw) {
    return null;
  }

  return (
    <PropertyGroup
      object={gameObjectInspected}
      propertyGroupTitle={"styles"}
      propertyGroupNames={STYLE_PROPS}
    />
  );
};
const STYLE_PROPS = ["strokeStyle", "fillStyle", "alpha", "lineWidth"];

const RigidBodyDevtools = ({ gameObjectInspected }) => {
  if (!gameObjectInspected.rigid) {
    return null;
  }

  return (
    <PropertyGroup
      object={gameObjectInspected}
      propertyGroupTitle={"physics"}
      propertyGroupNames={PHYSIC_PROPS}
    />
  );
};

const PHYSIC_PROPS = [
  "velocityX",
  "velocityY",
  "velocityAngle",
  "mass",
  "friction",
  "frictionAmbient",
  "restitution",
  "rotationInertiaCoef",
];

const PropertyGroup = ({ object, propertyGroupTitle, propertyGroupNames }) => {
  return (
    <details className="devtools-details-category">
      <summary>{propertyGroupTitle}</summary>
      <ol>
        {propertyGroupNames.map((key) => {
          const value = object[key];
          return (
            <li key={key}>
              <EditableObjectProperty
                object={object}
                propertyName={key}
                propertyValue={value}
              />
            </li>
          );
        })}
      </ol>
    </details>
  );
};

// TODO: en faisant un double click on peut éditer une valeur
// Nice to have: a dedicated way to update value for some properties
const EditableObjectProperty = ({ object, propertyName, propertyValue }) => {
  if (typeof propertyValue === "number") {
    return (
      <span>
        {propertyName}:
        <EditableInputNumber
          value={propertyValue}
          onChange={(value) => {
            object[propertyName] = value;
          }}
        />
      </span>
    );
  }

  if (typeof propertyValue === "boolean") {
    return (
      <span>
        {propertyName}: {propertyValue}
      </span>
    );
  }

  if (typeof propertyValue === "string") {
    return (
      <span>
        {propertyName}: {propertyValue}
      </span>
    );
  }

  return null;
};

const EditableInputNumber = ({ value, onChange }) => {
  const inputNodeRef = useRef();
  const [editable, editableSetter] = useState(false);
  const [valueLocal, valueLocalSetter] = useState(value);
  const charCount = String(valueLocal).length + 1;
  const fontSize = 12; // should be dynamic

  useEffect(() => {
    valueLocalSetter(value);
  }, [value]);

  return (
    <input
      className="input-editable"
      ref={inputNodeRef}
      type="number"
      readOnly={!editable}
      // size={String(val).length}
      style={{ width: charCount * fontSize }}
      // onInput={() => {
      //   const inputNode = inputNodeRef.current
      //   const valueFromInput = parseFloat(inputNode.value)
      //   valueEditedSetter(valueFromInput)
      // }}
      onKeyDown={(keydownEvent) => {
        const inputNode = inputNodeRef.current;
        if (keydownEvent.key === "Enter") {
          inputNode.blur();
        }
      }}
      onChange={() => {
        valueLocalSetter(inputNodeRef.current.value);
      }}
      onBlur={() => {
        const floatValue = floatValueFromInput(inputNodeRef.current);
        valueLocalSetter(floatValue);
        onChange(floatValue);
        editableSetter(false);
      }}
      onDoubleClick={() => {
        editableSetter(true);
      }}
      value={valueLocal}
    />
  );
};

const floatValueFromInput = (input) => {
  const { value } = input;
  if (value === "") {
    return 0;
  }
  const floatValue = parseFloat(value);
  return floatValue;
};
