import DataTable, {
  DataTableProps,
} from "@italodeandra/ui/components/Table/DataTable";
import { useMemo } from "react";
import Alert from "@italodeandra/ui/components/Alert/Alert";
import Button from "@italodeandra/ui/components/Button/Button";
import { ArrowPathIcon } from "@heroicons/react/20/solid";
import Stack from "@italodeandra/ui/components/Stack/Stack";
import { AccountGetApiResponse } from "../../../pages/api/account/get";
import {
  AccountListPagesApiResponse,
  useAccountListPages,
} from "../../../pages/api/account/list-pages";
import { useAgentAccountRefreshPages } from "../../../pages/api/agent/account-refresh-pages";
import { useAccountSavePagesRefresh } from "../../../pages/api/account/save-pages-refresh";
import { showNotification } from "@italodeandra/ui/components/Notifications/notifications.state";
import { useAuthGetUser } from "@italodeandra/auth/api/getUser";

export function AccountPages({ account }: { account: AccountGetApiResponse }) {
  let { data: user } = useAuthGetUser();

  let {
    data: groups,
    isFetching,
    isError,
    refetch,
  } = useAccountListPages({
    accountId: account._id,
  });

  let columns = useMemo<
    DataTableProps<AccountListPagesApiResponse[0]>["columns"]
  >(
    () => [
      {
        title: "Nome",
        accessor: "name",
      },
    ],
    []
  );

  // let agent = useAgent();
  let { mutate: refresh, isLoading: isRefreshing } =
    useAgentAccountRefreshPages({
      onSuccess(data) {
        saveRefresh({
          pages: data.pages,
          accountId: account._id,
        });
      },
      onError(error) {
        showNotification({
          icon: "error",
          message: "Não foi possível escanear as páginas",
        });
        console.error(JSON.stringify(error, null, 2));
      },
    });
  let { mutate: saveRefresh, isLoading: isSavingRefresh } =
    useAccountSavePagesRefresh({
      onSuccess() {
        showNotification({
          icon: "success",
          message: "Páginas atualizadas",
          timeout: "5s",
        });
      },
    });

  return (
    <Stack className="flex flex-1 flex-col">
      <Button
        leading={<ArrowPathIcon />}
        variant="filled"
        color="primary"
        loading={isRefreshing || isSavingRefresh}
        onClick={() => refresh({ accountId: account._id })}
        // disabled={agent !== "available" || account.version !== 2}
        disabled={user?._id !== "64c71b3771e7d70b46470436"}
      >
        Atualizar páginas (Desativado)
      </Button>
      <DataTable
        className="flex flex-1 flex-col"
        columns={columns}
        data={groups}
        isLoading={isFetching}
        autoHeight
        noRecords={
          !isFetching && isError ? (
            <Alert
              title="Ocorreu um erro inesperado tentando listar as páginas"
              variant="error"
              className="m-2"
              actions={
                <Button variant="text" color="error" onClick={() => refetch()}>
                  Tente novamente
                </Button>
              }
            />
          ) : (
            "Nenhuma página encontrada"
          )
        }
      />
    </Stack>
  );
}
