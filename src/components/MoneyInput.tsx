import CleaveInput from "@italodeandra/ui/components/Input/CleaveInput";
import { InputProps } from "@italodeandra/ui/components/Input/Input";
import { ForwardedRef, forwardRef } from "react";

function MoneyInput(
  props: InputProps<undefined>,
  ref: ForwardedRef<HTMLInputElement>
) {
  return (
    <CleaveInput
      {...props}
      ref={ref}
      options={{
        prefix: "R$",
        numeral: true,
        numeralDecimalMark: ",",
        delimiter: ".",
        noImmediatePrefix: true,
        rawValueTrimPrefix: true,
      }}
    />
  );
}

export default forwardRef(MoneyInput);
