import { NextApiRequest, NextApiResponse } from "next";
import { AuthConfig } from "../..";
import { InferApiArgs, InferApiResponse } from "@italodeandra/next/api/apiHandlerWrapper";
import { UseMutationOptions } from "@tanstack/react-query";
import { AxiosError } from "axios";
export default function authPanelUserStopImpersonateHandler(_args: void, req: NextApiRequest, res: NextApiResponse, { connectDb, disableImpersonate }: AuthConfig): Promise<void>;
export declare type AuthPanelUserStopImpersonateResponse = InferApiResponse<typeof authPanelUserStopImpersonateHandler>;
export declare type AuthPanelUserStopImpersonateArgs = InferApiArgs<typeof authPanelUserStopImpersonateHandler>;
export declare const useAuthPanelUserStopImpersonate: (options?: UseMutationOptions<AuthPanelUserStopImpersonateResponse, AxiosError, AuthPanelUserStopImpersonateArgs>) => import("@tanstack/react-query").UseMutationResult<void, AxiosError<unknown, any>, void, unknown>;
