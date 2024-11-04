// https://medium.com/@francoisromain/smooth-a-svg-path-with-cubic-bezier-curves-e37b49d46c74

export const getDrawCommandsForQuadraticCurve = (
  points,
  { area = false } = {},
) => {
  if (points.length === 0) {
    return [];
  }

  if (points.length === 1) {
    const firstPoint = points[0];
    return [moveTo(firstPoint), lineTo(firstPoint)];
  }

  if (area) {
    let xMax = 0;
    points.forEach((point) => {
      if (point.x > xMax) {
        xMax = point.x;
      }
    });
    points = [{ x: -2, y: 100 }, ...points, { x: xMax + 2, y: 100 }];
  }

  const [firstPoint, secondPoint] = points;
  const commands = [];
  const addCommand = (command) => {
    commands.push(command);
  };

  addCommand(moveTo(firstPoint));

  if (points.length === 2) {
    addCommand(lineTo(firstPoint));
    addCommand(lineTo(secondPoint));
    return commands;
  }

  let i = 0;
  while (i < points.length - 1) {
    const point = points[i];
    const nextPoint = points[i + 1];
    const pointBetweenPointAndNextPoint = {
      x: (point.x + nextPoint.x) / 2,
      y: (point.y + nextPoint.y) / 2,
    };

    addCommand(
      quadraticCurveTo({
        controlPointX: (pointBetweenPointAndNextPoint.x + point.x) / 2,
        controlPointY: point.y,
        endPointX: pointBetweenPointAndNextPoint.x,
        endPointY: pointBetweenPointAndNextPoint.y,
      }),
    );
    addCommand(
      quadraticCurveTo({
        controlPointX: (pointBetweenPointAndNextPoint.x + nextPoint.x) / 2,
        controlPointY: nextPoint.y,
        endPointX: nextPoint.x,
        endPointY: nextPoint.y,
      }),
    );
    i++;
  }

  return commands;
};

const moveTo = ({ x, y }) => {
  return {
    type: "moveTo",
    x,
    y,
  };
};

const lineTo = ({ x, y }) => {
  return {
    type: "lineTo",
    x,
    y,
  };
};

const quadraticCurveTo = ({
  controlPointX,
  controlPointY,
  endPointX,
  endPointY,
}) => {
  return {
    type: "quadraticCurveTo",
    controlPointX,
    controlPointY,
    endPointX,
    endPointY,
  };
};
