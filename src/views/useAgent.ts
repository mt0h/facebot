import { useAgentStatus } from "../pages/api/agent/status";
import { useEffect } from "react";
import { getCookie } from "cookies-next";
import { useAgentAuth } from "../pages/api/agent/auth";
import { AGENT_VERSION } from "../constants";

export function useAgent(dontSkipAuth?: boolean) {
  let { data } = useAgentStatus();
  let { mutate: auth } = useAgentAuth();
  useEffect(() => {
    if (data && dontSkipAuth) {
      let authCookie = getCookie("auth") as string | undefined;
      if (authCookie) {
        auth({
          auth: authCookie,
        });
      }
    }
  }, [auth, data, dontSkipAuth]);

  if (!data) {
    return "unavailable" as const;
  }
  if (data?.version !== AGENT_VERSION) {
    return "outdated" as const;
  }
  return "available" as const;
}
