import React from "react"

export const GameObjectInspection = ({ gameObjectInspected }) => {
  if (!gameObjectInspected) {
    return "no game object inspected"
  }

  return (
    <>
      <span>{gameObjectInspected.name}</span>
      <ShapeDevtools gameObjectInspected={gameObjectInspected} />
      <StyleDevtools gameObjectInspected={gameObjectInspected} />
      <RigidBodyDevtools gameObjectInspected={gameObjectInspected} />
    </>
  )
}

const ShapeDevtools = ({ gameObjectInspected }) => {
  if (gameObjectInspected.shapeName === "rectangle") {
    return (
      <PropertyGroup
        object={gameObjectInspected}
        propertyGroupTitle={"rectangle"}
        propertyGroupNames={RECTANGLE_SHAPE_PROPS}
      />
    )
  }

  if (gameObjectInspected.shapeName === "circle") {
    return (
      <PropertyGroup
        object={gameObjectInspected}
        propertyGroupTitle={"circle"}
        propertyGroupNames={CIRCLE_SHAPE_PROPS}
      />
    )
  }
  return null
}
const SHAPE_PROPS = ["centerX", "centerY", "angle"]
const RECTANGLE_SHAPE_PROPS = [...SHAPE_PROPS, "width", "height"]
const CIRCLE_SHAPE_PROPS = [...SHAPE_PROPS, "radius"]

const StyleDevtools = ({ gameObjectInspected }) => {
  if (!gameObjectInspected.draw) {
    return null
  }

  return (
    <PropertyGroup
      object={gameObjectInspected}
      propertyGroupTitle={"styles"}
      propertyGroupNames={STYLE_PROPS}
    />
  )
}
const STYLE_PROPS = ["strokeStyle", "fillStyle", "alpha", "lineWidth"]

const RigidBodyDevtools = ({ gameObjectInspected }) => {
  if (!gameObjectInspected.rigid) {
    return null
  }

  return (
    <PropertyGroup
      object={gameObjectInspected}
      propertyGroupTitle={"physics"}
      propertyGroupNames={PHYSIC_PROPS}
    />
  )
}

const PHYSIC_PROPS = [
  "velocityX",
  "velocityY",
  "velocityAngle",
  "mass",
  "friction",
  "frictionAmbient",
  "restitution",
  "rotationInertiaCoef",
]

const PropertyGroup = ({ object, propertyGroupTitle, propertyGroupNames }) => {
  return (
    <details className="devtools-details-category">
      <summary>{propertyGroupTitle}</summary>
      <ol>
        {propertyGroupNames.map((key) => {
          const value = object[key]
          return (
            <li key={key}>
              <EditableObjectProperty object={object} propertyName={key} propertyValue={value} />
            </li>
          )
        })}
      </ol>
    </details>
  )
}

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
            object[propertyName] = value
          }}
        />
      </span>
    )
  }

  if (typeof propertyValue === "boolean") {
    return (
      <span>
        {propertyName}: {propertyValue}
      </span>
    )
  }

  if (typeof propertyValue === "string") {
    return (
      <span>
        {propertyName}: {propertyValue}
      </span>
    )
  }

  return null
}

const EditableInputNumber = ({ value, onChange }) => {
  const inputNodeRef = React.useRef()
  const [editable, editableSetter] = React.useState(false)
  const [val, valSetter] = React.useState(value)

  const charCount = String(val).length + 1
  const fontSize = 12 // should be dynamic

  return (
    <input
      className="input-editable"
      ref={inputNodeRef}
      type="number"
      readOnly={!editable}
      // size={String(val).length}
      style={{ width: charCount * fontSize }}
      onInput={() => {
        const inputNode = inputNodeRef.current
        const valueFromInput = parseFloat(inputNode.value)
        valSetter(valueFromInput)
      }}
      onBlur={() => {
        onChange(val)
        editableSetter(false)
      }}
      onChange={() => {}}
      onDoubleClick={() => {
        editableSetter(true)
      }}
      defaultValue={val}
    />
  )
}
