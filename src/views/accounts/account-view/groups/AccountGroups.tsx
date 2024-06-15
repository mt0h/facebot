import {
  AccountGroupListApiResponse,
  useAccountGroupList,
} from "../../../../pages/api/account-group/list";
import DataTable, {
  DataTableProps,
} from "@italodeandra/ui/components/Table/DataTable";
import { useMemo } from "react";
import Alert from "@italodeandra/ui/components/Alert/Alert";
import Button from "@italodeandra/ui/components/Button/Button";
import Stack from "@italodeandra/ui/components/Stack/Stack";
import { AccountGetApiResponse } from "../../../../pages/api/account/get";
import Group from "@italodeandra/ui/components/Group/Group";
import { DeleteAccountGroupButton } from "./DeleteAccountGroupButton";

export function AccountGroups({ account }: { account: AccountGetApiResponse }) {
  let {
    data: groups,
    isFetching,
    isError,
    refetch,
  } = useAccountGroupList({
    accountId: account._id,
  });

  let columns = useMemo<
    DataTableProps<AccountGroupListApiResponse[0]>["columns"]
  >(
    () => [
      {
        title: "Nome",
        accessor: "name",
      },
      {
        title: "",
        render: (item) => (
          <Group className="-my-0.5 justify-end">
            <DeleteAccountGroupButton accountGroupId={item._id} />
          </Group>
        ),
      },
    ],
    []
  );

  return (
    <Stack className="flex-1">
      <DataTable
        className="flex-1"
        columns={columns}
        data={groups}
        isLoading={isFetching}
        autoHeight
        noRecords={
          !isFetching && isError ? (
            <Alert
              title="Ocorreu um erro inesperado tentando listar os grupos"
              variant="error"
              className="m-2"
              actions={
                <Button variant="text" color="error" onClick={() => refetch()}>
                  Tente novamente
                </Button>
              }
            />
          ) : (
            "Nenhum grupo encontrado"
          )
        }
      />
    </Stack>
  );
}
