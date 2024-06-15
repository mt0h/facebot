import Button from "@italodeandra/ui/components/Button/Button";
import { TrashIcon } from "@heroicons/react/20/solid";
import { AccountGroupListApiResponse } from "../../../../pages/api/account-group/list";
import { useAccountGroupDelete } from "../../../../pages/api/account-group/delete";

export function DeleteAccountGroupButton({
  accountGroupId,
}: {
  accountGroupId: AccountGroupListApiResponse[0]["_id"];
}) {
  let { mutate: deleteGroup, isLoading } = useAccountGroupDelete();

  return (
    <Button
      leading={<TrashIcon />}
      size="sm"
      onClick={(e) => {
        e.stopPropagation();
        deleteGroup({
          _id: accountGroupId,
        });
      }}
      loading={isLoading}
    >
      Excluir
    </Button>
  );
}
