import { MouseEventHandler, ReactNode } from "react";
export type TableRowProps = {
    children?: ReactNode;
    onClick?: MouseEventHandler<HTMLTableRowElement>;
};
declare const _default: import("react").ForwardRefExoticComponent<TableRowProps & import("react").RefAttributes<HTMLTableRowElement>>;
export default _default;
