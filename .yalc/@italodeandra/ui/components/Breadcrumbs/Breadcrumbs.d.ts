/// <reference types="react" />
export type BreadcrumbsProps = {
    pages?: {
        title: string;
        href?: string;
        loading?: boolean;
    }[];
    homeHref?: string;
    className?: string;
    loading?: boolean;
};
export default function Breadcrumbs({ pages, homeHref, className, loading, }: BreadcrumbsProps): JSX.Element | null;
