import {
  cloneElement,
  ReactElement,
  ReactNode,
  useCallback,
  useMemo,
} from "react";
import { NextSeo } from "next-seo";
import DataTable, {
  DataTableProps,
} from "@italodeandra/ui/components/Table/DataTable";
import Breadcrumbs from "@italodeandra/ui/components/Breadcrumbs/Breadcrumbs";
import Button from "@italodeandra/ui/components/Button/Button";
import Alert from "@italodeandra/ui/components/Alert/Alert";
import { QueueListApiResponse, useQueueList } from "../../pages/api/queue/list";
import dayjs from "dayjs";
import Tooltip from "@italodeandra/ui/components/Tooltip/Tooltip";
import { TaskBot } from "../../collections/Task";
import ms from "ms";
import Routes from "../../Routes";
import { useRouter } from "next/router";
import {
  DocumentDuplicateIcon,
  NoSymbolIcon,
} from "@heroicons/react/24/outline";
import { useQueueCancelPending } from "../../pages/api/queue/cancel-pending";
import Loading from "@italodeandra/ui/components/Loading/Loading";
import { state } from "../state";

function CancelWrapper({
  children,
  item,
}: {
  item: QueueListApiResponse[0];
  children: ReactNode;
}) {
  let { mutate, isLoading } = useQueueCancelPending();
  return (
    <>
      {item.tasks.PENDING && children
        ? cloneElement(children as ReactElement, {
            onClick: () => {
              mutate(item);
            },
            ...(isLoading ? { children: <Loading /> } : {}),
          })
        : null}
    </>
  );
}

export default function QueueView() {
  let router = useRouter();
  let { data, isFetching, isError, refetch } = useQueueList({
    refetchInterval(data) {
      return data?.find(
        (item) => item.tasks.PENDING + item.tasks.IN_PROGRESS > 0
      )
        ? ms("2s")
        : false;
    },
  });

  let columns = useMemo(() => {
    let columns: DataTableProps<QueueListApiResponse[0]>["columns"] = [];

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
        title: "URL",
        render: ({ url }) => (
          <Tooltip content={url}>
            <span
              onClick={(e) => e.stopPropagation()}
              onDoubleClick={() => window.open(url, "_blank")}
              className="block max-w-[200px] select-all truncate text-right"
              style={{
                direction: "rtl",
              }}
            >
              {url}
            </span>
          </Tooltip>
        ),
      },
      {
        title: "Data",
        render: ({ date }) => (date ? dayjs(date).format("LLL") : null),
      },
      {
        title: "Pendente",
        render: ({ tasks }) => tasks.PENDING || 0,
      },
      {
        title: "Em andamento",
        render: ({ tasks }) => tasks.IN_PROGRESS || 0,
      },
      {
        title: "Finalizados",
        render: ({ tasks }) => tasks.DONE || 0,
      },
      {
        title: "Erros/Cancelados",
        render: ({ tasks }) => tasks.ERROR || 0,
      },
      {
        title: "Duração média",
        render: ({ meanDuration }) => (meanDuration ? ms(meanDuration) : null),
      }
    );

    columns.push({
      title: "Criado",
      render: ({ createdAt }) => (
        <Tooltip content={dayjs(createdAt).format("LLL")}>
          <span>{dayjs(createdAt).fromNow()}</span>
        </Tooltip>
      ),
    });

    return columns;
  }, []);

  let handleRowClick = useCallback(
    (item: QueueListApiResponse[0]) =>
      router.push(Routes.PanelQueueTasks(item._id)),
    [router]
  );

  let pages = useMemo(() => [{ title: "Fila" }], []);

  return (
    <div className="flex flex-1 flex-col md:px-2 md:pb-2">
      <NextSeo title={pages[0].title} />
      <Breadcrumbs pages={pages} className="mb-2" />

      <DataTable
        className="flex flex-1 flex-col"
        columns={columns}
        data={data}
        isLoading={isFetching}
        autoHeight
        onRowClick={handleRowClick}
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
        actions={[
          {
            title: "Copiar",
            icon: <DocumentDuplicateIcon />,
            onClick: (task) => {
              if (task.bot === TaskBot.SHARE_ON_GROUP) {
                state.botCopy = {
                  tags: task.request?.tags,
                  description: task.request?.description,
                  postUrl: task.url,
                  schedule: true,
                };
                void router.push(Routes.PanelBotShareOnGroup);
              }
              if (task.bot === TaskBot.POST_COMMENT) {
                state.botCopy = {
                  tags: task.request?.tags,
                  description: task.request?.description,
                  comments: task.request?.comments,
                  postUrl: task.url,
                  like: task.request?.like,
                  schedule: true,
                };
                void router.push(Routes.PanelBotPostComments);
              }
            },
          },
          {
            title: "Cancelar pendente",
            wrapper: CancelWrapper,
            icon: <NoSymbolIcon />,
          },
        ]}
      />
    </div>
  );
}
