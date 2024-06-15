import { mutationFnWrapper } from "@italodeandra/next/api/apiHandlerWrapper";
import {
  useMutation,
  UseMutationOptions,
  useQueryClient,
} from "@tanstack/react-query";
import { AGENT_URL } from "../../../constants";
import { invalidate_accountList } from "../account/list";

export type AgentAccountImportResponse = {
  errors: { index: number; message: string }[];
};
export type AgentAccountImportArgs = {
  accounts: {
    index: number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    facebookCookies: any[];
    notes: string;
  }[];
  tags: string[];
};

const mutationKey = `${AGENT_URL}/account/import`;

export const useAgentAccountImport = (
  options?: UseMutationOptions<
    AgentAccountImportResponse,
    unknown,
    AgentAccountImportArgs
  >
) => {
  let queryClient = useQueryClient();
  return useMutation(
    [mutationKey],
    mutationFnWrapper<AgentAccountImportArgs, AgentAccountImportResponse>(
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
