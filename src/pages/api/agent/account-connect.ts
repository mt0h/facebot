import { mutationFnWrapper } from "@italodeandra/next/api/apiHandlerWrapper";
import {
  useMutation,
  UseMutationOptions,
  useQueryClient,
} from "@tanstack/react-query";
import { AGENT_URL } from "../../../constants";
import { invalidate_accountList } from "../account/list";
import { invalidate_accountGet } from "../account/get";

export type AgentAccountConnectApiResponse = {
  id: string;
  name: string;
  facebookCookies: string;
};
export type AgentAccountConnectApiArgs = {
  accountId?: string;
};
export type AgentAccountConnectApiError = {
  code: number;
  message: string;
  stack: string;
};

const mutationKey = `${AGENT_URL}/account/connect`;

export const useAgentAccountConnect = (
  options?: UseMutationOptions<
    AgentAccountConnectApiResponse,
    AgentAccountConnectApiError,
    AgentAccountConnectApiArgs
  >
) => {
  const queryClient = useQueryClient();
  return useMutation(
    [mutationKey],
    mutationFnWrapper<
      AgentAccountConnectApiArgs,
      AgentAccountConnectApiResponse
    >(mutationKey),
    {
      ...options,
      retry: false,
      async onSuccess(...params) {
        const [, args] = params;
        await invalidate_accountList(queryClient);
        if (args.accountId) {
          await invalidate_accountGet(queryClient, { _id: args.accountId });
        }
        await options?.onSuccess?.(...params);
      },
    }
  );
};
