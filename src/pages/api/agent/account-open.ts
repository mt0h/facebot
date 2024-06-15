import { mutationFnWrapper } from "@italodeandra/next/api/apiHandlerWrapper";
import {
  useMutation,
  UseMutationOptions,
  useQueryClient,
} from "@tanstack/react-query";
import { AGENT_URL } from "../../../constants";
import { invalidate_accountList } from "../account/list";

export type AgentAccountOpenResponse = void;
export type AgentAccountOpenArgs = {
  accountId: string;
  tabs?: string[];
};

const mutationKey = `${AGENT_URL}/account/open`;

export const useAgentAccountOpen = (
  options?: UseMutationOptions<
    AgentAccountOpenResponse,
    unknown,
    AgentAccountOpenArgs
  >
) => {
  let queryClient = useQueryClient();
  return useMutation(
    [mutationKey],
    mutationFnWrapper<AgentAccountOpenArgs, AgentAccountOpenResponse>(
      mutationKey
    ),
    {
      ...options,
      async onSuccess(...params) {
        await invalidate_accountList(queryClient);
        await options?.onSuccess?.(...params);
      },
      retry: false,
    }
  );
};
