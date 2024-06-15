import {
  cloneElement,
  ReactElement,
  ReactNode,
  useMemo,
  useState,
} from "react";
import { NextSeo } from "next-seo";
import DataTable, {
  DataTableProps,
} from "@italodeandra/ui/components/Table/DataTable";
import Breadcrumbs from "@italodeandra/ui/components/Breadcrumbs/Breadcrumbs";
import Button from "@italodeandra/ui/components/Button/Button";
import Alert from "@italodeandra/ui/components/Alert/Alert";
import dayjs from "dayjs";
import Tooltip from "@italodeandra/ui/components/Tooltip/Tooltip";
import { TaskBot, TaskStatus } from "../../collections/Task";
import ms from "ms";
import { QueueGetApiResponse, useQueueGet } from "../../pages/api/queue/get";
import { useRouter } from "next/router";
import Routes from "../../Routes";
import Group from "@italodeandra/ui/components/Group/Group";
import {
  ArrowPathIcon,
  ArrowTopRightOnSquareIcon,
  LinkIcon,
  NoSymbolIcon,
  PhotoIcon,
} from "@heroicons/react/20/solid";
import { useQueueCancelPending } from "../../pages/api/queue/cancel-pending";
import Loading from "@italodeandra/ui/components/Loading/Loading";
import { useQueueRestartError } from "../../pages/api/queue/restart-task-error";
import { map, orderBy } from "lodash";
import { useAgentStatus } from "../../pages/api/agent/status";
import { useAgentAccountOpen } from "../../pages/api/agent/account-open";
import { StatusFilter } from "./StatusFilter";

function RestartWrapper({
  children,
  item,
}: {
  item: QueueGetApiResponse[0];
  children: ReactNode;
}) {
  let { mutate, isLoading } = useQueueRestartError();
  return (
    <>
      {[TaskStatus.ERROR, TaskStatus.TIMEOUT].includes(item.status) && children
        ? cloneElement(children as ReactElement, {
            onClick: () => {
              mutate({
                _id: [item._id],
                queueId: item.queueId,
              });
            },
            ...(isLoading ? { children: <Loading /> } : {}),
          })
        : null}
    </>
  );
}

function OpenInBrowserWrapper({
  children,
  item,
}: {
  item: QueueGetApiResponse[0];
  children: ReactNode;
}) {
  let { isSuccess: isAgentAvailable, isLoading: isLoadingAgent } =
    useAgentStatus();
  let { mutate: open, isLoading } = useAgentAccountOpen();

  return (
    <>
      {[TaskStatus.ERROR].includes(item.status) && children
        ? cloneElement(children as ReactElement, {
            onClick: () => {
              open({
                accountId: item.account._id,
                tabs: item.account.tabs,
              });
            },
            disabled: !isAgentAvailable || item.account.version !== 2,
            ...(isLoading || isLoadingAgent ? { children: <Loading /> } : {}),
          })
        : null}
    </>
  );
}

function RestartAllButton({
  tasksWithError,
}: {
  tasksWithError: QueueGetApiResponse;
}) {
  let { mutate, isLoading } = useQueueRestartError();

  let handleClick = () => {
    if (!isLoading) {
      mutate({
        _id: tasksWithError.map((t) => t._id),
        queueId: tasksWithError[0].queueId,
      });
    }
  };

  return tasksWithError.length ? (
    <Tooltip content="Reiniciar todas com erro" placement="left">
      <Button icon loading={isLoading} onClick={handleClick}>
        <ArrowPathIcon />
      </Button>
    </Tooltip>
  ) : null;
}

export default function QueueTasksView() {
  let router = useRouter();
  let _id = router.query.id as string;

  let [sort, setSort] = useState<[string, "asc" | "desc"][]>([]);
  let [page, setPage] = useState(1);
  let [status, setStatus] = useState<TaskStatus[]>([]);

  let { data, isFetching, isError, refetch } = useQueueGet(
    { _id },
    {
      refetchInterval(data) {
        return data?.find((item) =>
          [TaskStatus.IN_PROGRESS, TaskStatus.PENDING].includes(item.status)
        )
          ? ms("5s")
          : false;
      },
    }
  );

  let columns = useMemo(() => {
    let columns: DataTableProps<QueueGetApiResponse[0]>["columns"] = [];

    columns.push(
      {
        title: "Robô",
        render: ({ bot }) =>
          ({
            [TaskBot.POST_COMMENT]: "Postar comentários",
            [TaskBot.SHARE_ON_GROUP]: "Compartilhar em grupos",
            [TaskBot.POST_COMMENT_GQL]: "Postar comentários (GraphQL)",
            [TaskBot.SHARE_ON_GROUP_GQL]: "Compartilhar em grupos (GraphQL)",
          }[bot]),
      },
      {
        id: "account.name",
        title: "Perfil",
        render: ({ account }) => account?.name,
        sortable: true,
      },
      {
        id: "group",
        title: "Grupo",
        accessor: "group",
        sortable: true,
      },
      {
        id: "status",
        title: "Status",
        render: ({ status }) =>
          ({
            [TaskStatus.DONE]: "Finalizado",
            [TaskStatus.TIMEOUT]: "Tempo expirado",
            [TaskStatus.ERROR]: "Erro",
            [TaskStatus.PENDING]: "Pendente",
            [TaskStatus.IN_PROGRESS]: "Em andamento",
            [TaskStatus.CANCELLED]: "Cancelado",
          }[status]),
        sortable: true,
      },
      {
        title: "Duração",
        render: ({ response }) =>
          response?.duration ? ms(response.duration) : undefined,
      },
      {
        title: "Erro",
        render: ({ response }) => {
          let errorMessage =
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            response?.error?.message || (response?.error as any); // TODO remove ` || (response?.error as any)` in a few days because I fixed all the errors to have message inside
          return errorMessage ? (
            <Tooltip content={errorMessage}>
              <span>{errorMessage}</span>
            </Tooltip>
          ) : null;
        },
        cellClassName: "max-w-[300px] truncate",
      },
      {
        title: "Atualizado",
        render: ({ updatedAt }) => (
          <Tooltip content={dayjs(updatedAt).format("LLL")}>
            <span>{dayjs(updatedAt).fromNow()}</span>
          </Tooltip>
        ),
      },
      {
        title: "Criado",
        render: ({ createdAt }) => (
          <Tooltip content={dayjs(createdAt).format("LLL")}>
            <span>{dayjs(createdAt).fromNow()}</span>
          </Tooltip>
        ),
      }
    );

    return columns;
  }, []);

  let pages = useMemo(
    () => [{ title: "Fila", href: Routes.PanelQueue }, { title: "Tarefas" }],
    []
  );

  let { mutate: cancelPending, isLoading: isCanceling } =
    useQueueCancelPending();

  let sortedData = useMemo(
    () => orderBy(data, map(sort, 0), map(sort, 1)),
    [data, sort]
  );

  let filteredData = useMemo(
    () =>
      sortedData.filter(
        (item) => !status.length || status.includes(item.status)
      ),
    [sortedData, status]
  );

  let itemsPerPage = 20;
  let paginatedData = useMemo(
    () =>
      filteredData.slice(
        (page - 1) * itemsPerPage,
        (page - 1) * itemsPerPage + itemsPerPage
      ),
    [itemsPerPage, page, filteredData]
  );

  return (
    <div className="flex flex-1 flex-col md:px-2 md:pb-2">
      <NextSeo title={pages[0].title} />
      <Group className="mb-2 w-full items-center" wrap>
        <Breadcrumbs pages={pages} />
        <StatusFilter status={status} setStatus={setStatus} />
        <div className="flex-grow" />
        <RestartAllButton
          tasksWithError={sortedData?.filter((i) =>
            [TaskStatus.ERROR, TaskStatus.TIMEOUT].includes(i.status)
          )}
        />
        {sortedData?.some((item) => item.status === TaskStatus.PENDING) && (
          <Button
            leading={<NoSymbolIcon />}
            color="error"
            loading={isCanceling}
            onClick={() => {
              cancelPending({
                _id,
              });
            }}
          >
            Cancelar pendente
          </Button>
        )}
      </Group>

      <DataTable
        className="flex flex-1 flex-col"
        columns={columns}
        data={paginatedData}
        isLoading={isFetching}
        autoHeight
        actions={[
          {
            title: "Abrir screenshot",
            href: (item) => item.response?.error?.screenshot || "#",
            icon: <PhotoIcon />,
            wrapper: ({ children, item }) => (
              <>
                {item.response?.error?.screenshot &&
                !item.response?.error?.screenshot.startsWith("Couldn't")
                  ? children
                  : null}
              </>
            ),
            target: "_blank",
          },
          {
            title: "Reiniciar",
            wrapper: RestartWrapper,
            icon: <ArrowPathIcon />,
          },
          {
            title: "Abrir conta em contra aba",
            icon: <LinkIcon />,
            href: (item) =>
              item.account && Routes.PanelAccount(item.account._id),
            target: "_blank",
          },
          {
            title: "Abrir conta no navegador",
            icon: <ArrowTopRightOnSquareIcon />,
            wrapper: OpenInBrowserWrapper,
          },
        ]}
        noRecords={
          !isFetching && isError ? (
            <Alert
              title="Ocorreu um erro inesperado tentando listar as tarefas"
              variant="error"
              className="m-2"
              actions={
                <Button variant="text" color="error" onClick={() => refetch()}>
                  Tentar novamente
                </Button>
              }
            />
          ) : (
            "Nenhuma tarefa encontrada"
          )
        }
        sort={sort}
        onChangeSort={setSort}
        pagination
        itemsPerPage={itemsPerPage}
        totalItems={filteredData.length}
        currentPage={page}
        onChangePage={setPage}
        previousText="Anterior"
        nextText="Próxima"
        showingText="Mostrando"
        toText="a"
        ofText="de"
        resultsText="resultados"
      />
    </div>
  );
}
