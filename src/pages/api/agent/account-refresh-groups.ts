import { mutationFnWrapper } from "@italodeandra/next/api/apiHandlerWrapper";
import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { AGENT_URL } from "../../../constants";

export type AgentAccountRefreshGroupsApiResponse = {
  groups: { id: string; name: string; gqlId?: string }[];
};
export type AgentAccountRefreshGroupsApiArgs = {
  accountId: string;
};

const mutationKey = `${AGENT_URL}/account/refresh-groups`;

export const useAgentAccountRefreshGroups = (
  options?: UseMutationOptions<
    AgentAccountRefreshGroupsApiResponse,
    unknown,
    AgentAccountRefreshGroupsApiArgs
  >
) =>
  useMutation(
    [mutationKey],
    mutationFnWrapper<
      AgentAccountRefreshGroupsApiArgs,
      AgentAccountRefreshGroupsApiResponse
    >(mutationKey),
    {
      ...options,
      retry: false,
    }
  );
