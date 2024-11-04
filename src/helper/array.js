const comparerDefaultValue = (a, b) => {
  if (a < b) {
    return -1;
  }
  if (a > b) {
    return 1;
  }
  return 0;
};

export const getSortedIndexForValueInArray = (
  value,
  array,
  comparer = comparerDefaultValue,
) => {
  const length = array.length;
  let i = length;
  let indexOfPreviousValue = -1;
  while (i--) {
    const order = comparer(array[i], value);

    // order > 0 means the item must be to the right of the current one
    if (order > 0) {
      indexOfPreviousValue = i;
    } else if (order === 0) {
      // order === 0 means the item is equivalent to the current one, it could be to it's right or left
      // we force item to be to the right of the first equivalent item only, next equivalent item are ignored
      if (indexOfPreviousValue === -1) {
        indexOfPreviousValue = i + 1;
      }
    } else if (indexOfPreviousValue !== -1) {
      // else we know item must be to the left of the current one
      // so toTheRightOfItemIndex was set we know item index is the one
      break;
    }
  }

  if (indexOfPreviousValue === -1) {
    return length;
  }
  return indexOfPreviousValue;
};
