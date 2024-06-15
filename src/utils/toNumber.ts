import { isNil } from "lodash";

export function toNumber(number: string | number | null | undefined) {
  return number !== "" && !isNil(number) && !isNaN(+number)
    ? +number
    : undefined;
}
