import React from "react";
import { getDrawCommandsForQuadraticCurve } from "./draw-command-curve-quadratic.js";
import { svgPathCommandFromDrawCommands } from "./draw-command-svg-path.js";

export const PulseGraphRAF = ({
  backgroundColor = "#020",
  maxValues = 100,
  min = 0,
  max = 30,
  minDynamic = true,
  maxDynamic = true,
  legend,
}) => {
  const [values, valuesSetter] = React.useState([]);

  const [minValue, minValueSetter] = React.useState(min);
  const [maxValue, maxValueSetter] = React.useState(max);

  React.useEffect(() => {
    let previousMs;
    const loop = () => {
      const nowMs = Date.now();

      if (previousMs) {
        const msEllapsed = nowMs - previousMs;
        if (msEllapsed > 16) {
          const fpsEstimation = 1000 / msEllapsed;
          valuesSetter((values) => {
            if (values.length > maxValues) {
              // return values
              return [...values.slice(1), fpsEstimation];
            }
            return [...values, fpsEstimation];
          });
        }
      }

      previousMs = nowMs;
      window.requestAnimationFrame(loop);
    };
    loop();
  }, []);

  React.useEffect(() => {
    if (!minDynamic) {
      minValueSetter(min);
      return;
    }

    let minValueFromValues = Infinity;
    values.forEach((value) => {
      if (value < minValue) {
        minValueFromValues = value;
      }
    });
    if (minValueFromValues < minValue) {
      minValueSetter(minValueFromValues);
    }
  }, [minDynamic, min, values, minValue]);

  React.useEffect(() => {
    if (!maxDynamic) {
      maxValueSetter(max);
      return;
    }

    let maxValueFromValues = -Infinity;
    values.forEach((value) => {
      if (value > maxValue) {
        maxValueFromValues = value;
      }
    });
    if (maxValueFromValues > maxValue) {
      maxValueSetter(maxValueFromValues);
    }
  }, [maxDynamic, max, values, maxValue]);

  return (
    <PulseGraph
      backgroundColor={backgroundColor}
      minValue={minValue}
      maxValue={maxValue}
      values={values}
      maxValues={maxValues}
      precision={0}
      legend={legend}
    />
  );
};

const PulseGraph = ({
  backgroundColor,
  minValue,
  maxValue,
  values,
  maxValues,
} = {}) => {
  const magnitude = Math.abs(minValue) + Math.abs(maxValue);

  const widthPerPoint = 100 / maxValues;
  let graphY = 5;

  let x = 0;
  const points = values.map((value) => {
    const diffWithMax = maxValue - value;
    const ratio = diffWithMax / magnitude;
    const yRelativeToGraph = 100 * ratio;
    const y = graphY + yRelativeToGraph;
    const point = {
      x,
      y,
      value,
    };
    x += widthPerPoint;

    return point;
  });

  const drawCommands = getDrawCommandsForQuadraticCurve(points, { area: true });

  return (
    <svg
      viewBox="0 0 100 100"
      className="pulse-graph"
      preserveAspectRatio="none"
    >
      <g className="pulse-graph-background">
        {backgroundColor ? (
          <rect
            x="0"
            y="0"
            width="100"
            height="100"
            fill={backgroundColor}
          ></rect>
        ) : null}
      </g>

      <path
        d={svgPathCommandFromDrawCommands(drawCommands)}
        stroke="red"
        fill="black"
      ></path>

      <g className="pulse-graph-points">
        {points.map((point, index) => {
          return (
            <circle
              key={index}
              cx={point.x}
              cy={point.y}
              data-value={point.value}
            ></circle>
          );
        })}
      </g>
    </svg>
  );
};
