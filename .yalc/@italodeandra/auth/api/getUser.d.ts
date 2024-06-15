/// <reference types="node" />
import { QueryClient, UseQueryOptions } from "@tanstack/react-query";
import { InferApiResponse } from "@italodeandra/next/api/apiHandlerWrapper";
import { AuthConfig } from ".";
import { IUser } from "../collections/user/User";
import { OptionsType } from "cookies-next/lib/types";
export interface AuthUserGetApiError {
    code: 401;
}
export default function getUserHandler(_args: void, req: OptionsType["req"], res: OptionsType["res"], { connectDb }: AuthConfig): Promise<import("mongodb").WithId<Pick<{
    email: string;
    type: string;
    password: string;
    passwordSalt: string;
    createdAt: Date;
    updatedAt: Date;
    _id: import("bson").ObjectID;
    emailVerified?: Date | undefined;
    name?: string | undefined;
    phoneNumber?: string | undefined;
    customData?: Pick<{}, never> | undefined;
}, "email" | "type" | "_id" | "name">>>;
export declare type AuthUserGetApiResponse = InferApiResponse<typeof getUserHandler>;
export declare const useAuthGetUser: (required?: boolean, options?: UseQueryOptions<AuthUserGetApiResponse | null, AuthUserGetApiError>) => {
    isLoading: boolean;
    data: {
        email: string;
        type: string;
        name?: string | undefined;
        _id: string;
    } | null;
    error: AuthUserGetApiError;
    isError: true;
    isLoadingError: false;
    isRefetchError: true;
    isSuccess: false;
    status: "error";
    dataUpdatedAt: number;
    errorUpdatedAt: number;
    failureCount: number;
    failureReason: AuthUserGetApiError | null;
    errorUpdateCount: number;
    isFetched: boolean;
    isFetchedAfterMount: boolean;
    isFetching: boolean;
    isInitialLoading: boolean;
    isPaused: boolean;
    isPlaceholderData: boolean;
    isPreviousData: boolean;
    isRefetching: boolean;
    isStale: boolean;
    refetch: <TPageData>(options?: (import("@tanstack/react-query").RefetchOptions & import("@tanstack/react-query").RefetchQueryFilters<TPageData>) | undefined) => Promise<import("@tanstack/react-query").QueryObserverResult<{
        email: string;
        type: string;
        name?: string | undefined;
        _id: string;
    } | null, AuthUserGetApiError>>;
    remove: () => void;
    fetchStatus: import("@tanstack/react-query").FetchStatus;
} | {
    isLoading: boolean;
    data: {
        email: string;
        type: string;
        name?: string | undefined;
        _id: string;
    } | null;
    error: null;
    isError: false;
    isLoadingError: false;
    isRefetchError: false;
    isSuccess: true;
    status: "success";
    dataUpdatedAt: number;
    errorUpdatedAt: number;
    failureCount: number;
    failureReason: AuthUserGetApiError | null;
    errorUpdateCount: number;
    isFetched: boolean;
    isFetchedAfterMount: boolean;
    isFetching: boolean;
    isInitialLoading: boolean;
    isPaused: boolean;
    isPlaceholderData: boolean;
    isPreviousData: boolean;
    isRefetching: boolean;
    isStale: boolean;
    refetch: <TPageData>(options?: (import("@tanstack/react-query").RefetchOptions & import("@tanstack/react-query").RefetchQueryFilters<TPageData>) | undefined) => Promise<import("@tanstack/react-query").QueryObserverResult<{
        email: string;
        type: string;
        name?: string | undefined;
        _id: string;
    } | null, AuthUserGetApiError>>;
    remove: () => void;
    fetchStatus: import("@tanstack/react-query").FetchStatus;
} | {
    isLoading: boolean;
    data: undefined;
    error: AuthUserGetApiError;
    isError: true;
    isLoadingError: true;
    isRefetchError: false;
    isSuccess: false;
    status: "error";
    dataUpdatedAt: number;
    errorUpdatedAt: number;
    failureCount: number;
    failureReason: AuthUserGetApiError | null;
    errorUpdateCount: number;
    isFetched: boolean;
    isFetchedAfterMount: boolean;
    isFetching: boolean;
    isInitialLoading: boolean;
    isPaused: boolean;
    isPlaceholderData: boolean;
    isPreviousData: boolean;
    isRefetching: boolean;
    isStale: boolean;
    refetch: <TPageData>(options?: (import("@tanstack/react-query").RefetchOptions & import("@tanstack/react-query").RefetchQueryFilters<TPageData>) | undefined) => Promise<import("@tanstack/react-query").QueryObserverResult<{
        email: string;
        type: string;
        name?: string | undefined;
        _id: string;
    } | null, AuthUserGetApiError>>;
    remove: () => void;
    fetchStatus: import("@tanstack/react-query").FetchStatus;
} | {
    isLoading: boolean;
    data: undefined;
    error: null;
    isError: false;
    isLoadingError: false;
    isRefetchError: false;
    isSuccess: false;
    status: "loading";
    dataUpdatedAt: number;
    errorUpdatedAt: number;
    failureCount: number;
    failureReason: AuthUserGetApiError | null;
    errorUpdateCount: number;
    isFetched: boolean;
    isFetchedAfterMount: boolean;
    isFetching: boolean;
    isInitialLoading: boolean;
    isPaused: boolean;
    isPlaceholderData: boolean;
    isPreviousData: boolean;
    isRefetching: boolean;
    isStale: boolean;
    refetch: <TPageData>(options?: (import("@tanstack/react-query").RefetchOptions & import("@tanstack/react-query").RefetchQueryFilters<TPageData>) | undefined) => Promise<import("@tanstack/react-query").QueryObserverResult<{
        email: string;
        type: string;
        name?: string | undefined;
        _id: string;
    } | null, AuthUserGetApiError>>;
    remove: () => void;
    fetchStatus: import("@tanstack/react-query").FetchStatus;
};
export declare const useAuthRequiredUserType: (typesToCheck: IUser["type"][], redirectTo?: string) => boolean;
export declare const useAuthRequiredUser: (redirectTo?: string) => boolean;
export declare const useAuthUser: () => boolean;
export declare const prefetch_authGetUser: (queryClient: QueryClient, args_0: void, args_1: (import("http").IncomingMessage & {
    cookies?: {
        [key: string]: string;
    } | Partial<{
        [key: string]: string;
    }> | undefined;
}) | undefined, args_2: import("http").ServerResponse<import("http").IncomingMessage> | undefined, args_3: AuthConfig) => Promise<void>;
export declare const setData_authGetUser: (queryClient: QueryClient, data: AuthUserGetApiResponse | null) => {
    email: string;
    type: string;
    name?: string | undefined;
    _id: string;
} | null | undefined;
export declare const invalidate_authGetUser: (queryClient: QueryClient) => Promise<void>;
