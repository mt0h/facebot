import { queryFnWrapper } from "@italodeandra/next/api/apiHandlerWrapper";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { AGENT_URL } from "../../../constants";

export type AgentStatusApiResponse = {
  version: string;
};

const queryKey = `${AGENT_URL}/`;

export const useAgentStatus = (
  options?: UseQueryOptions<AgentStatusApiResponse>
) =>
  useQuery<AgentStatusApiResponse>(
    [queryKey],
    queryFnWrapper<AgentStatusApiResponse>(queryKey),
    {
      ...options,
      retry: false,
    }
  );
