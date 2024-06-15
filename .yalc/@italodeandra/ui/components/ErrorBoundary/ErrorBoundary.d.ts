import { Component, ErrorInfo, ReactNode } from "react";
export default class ErrorBoundary extends Component<{
    title?: ReactNode;
    content?: ReactNode;
    tryAgain?: string;
    children: ReactNode;
}, {
    hasError: boolean;
}> {
    constructor(props: {
        children: ReactNode;
    });
    static getDerivedStateFromError(_error: Error): {
        hasError: boolean;
    };
    componentDidCatch(error: Error, errorInfo: ErrorInfo): void;
    render(): string | number | boolean | import("react").ReactFragment | JSX.Element | null | undefined;
}
