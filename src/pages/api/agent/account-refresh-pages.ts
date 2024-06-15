import { mutationFnWrapper } from "@italodeandra/next/api/apiHandlerWrapper";
import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { AGENT_URL } from "../../../constants";

export type AgentAccountRefreshPagesApiResponse = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  pages: { id: string; name: string; facebookCookies: any }[];
};
export type AgentAccountRefreshPagesApiArgs = {
  accountId: string;
};

const mutationKey = `${AGENT_URL}/account/refresh-pages`;

export const useAgentAccountRefreshPages = (
  options?: UseMutationOptions<
    AgentAccountRefreshPagesApiResponse,
    unknown,
    AgentAccountRefreshPagesApiArgs
  >
) =>
  useMutation(
    [mutationKey],
    mutationFnWrapper<
      AgentAccountRefreshPagesApiArgs,
      AgentAccountRefreshPagesApiResponse
    >(mutationKey),
    {
      ...options,
      retry: false,
    }
  );
