import { assert } from "@jsenv/assert"
import { findPairs } from "./physic.js"

//  B contact with A and C
{
  const actual = findPairs(["A", "B", "C"], (left, right) => {
    if (left === "A") {
      return right === "B"
    }
    if (left === "B") {
      return true
    }
    return right === "B"
  })
  const expected = [
    ["A", "B"],
    ["B", "C"],
  ]
  assert({ actual, expected })
}
