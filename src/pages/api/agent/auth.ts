import { mutationFnWrapper } from "@italodeandra/next/api/apiHandlerWrapper";
import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { AGENT_URL } from "../../../constants";

export type AgentAuthApiResponse = void;
export type AgentAuthApiArgs = {
  auth: string;
};

const mutationKey = `${AGENT_URL}/auth`;

export const useAgentAuth = (
  options?: UseMutationOptions<AgentAuthApiResponse, unknown, AgentAuthApiArgs>
) =>
  useMutation(
    [mutationKey],
    mutationFnWrapper<AgentAuthApiArgs, AgentAuthApiResponse>(mutationKey),
    {
      ...options,
      retry: false,
    }
  );
