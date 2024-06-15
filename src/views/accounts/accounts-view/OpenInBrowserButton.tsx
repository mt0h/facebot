import { useAgentStatus } from "../../../pages/api/agent/status";
import { useAgentAccountOpen } from "../../../pages/api/agent/account-open";
import Button from "@italodeandra/ui/components/Button/Button";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/20/solid";
import { IAccount } from "../../../collections/Account";
import Jsonify from "@italodeandra/next/utils/Jsonify";

export function OpenInBrowserButton({
  account,
}: {
  account: Pick<Jsonify<IAccount>, "_id" | "tabs" | "version">;
}) {
  let { isSuccess: isAgentAvailable, isLoading: isLoadingAgent } =
    useAgentStatus();
  let { mutate: open, isLoading } = useAgentAccountOpen();

  return (
    <Button
      trailing={<ArrowTopRightOnSquareIcon />}
      size="xs"
      onClick={(e) => {
        e.stopPropagation();
        open({
          accountId: account._id,
          tabs: account.tabs,
        });
      }}
      loading={isLoading || isLoadingAgent}
      disabled={!isAgentAvailable || account.version !== 2}
    >
      Abrir no navegador
    </Button>
  );
}
