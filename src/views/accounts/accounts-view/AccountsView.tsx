import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { NextSeo } from "next-seo";
import DataTable, {
  DataTableProps,
} from "@italodeandra/ui/components/Table/DataTable";
import Breadcrumbs from "@italodeandra/ui/components/Breadcrumbs/Breadcrumbs";
import Button from "@italodeandra/ui/components/Button/Button";
import Alert from "@italodeandra/ui/components/Alert/Alert";
import {
  ArrowUpTrayIcon,
  MagnifyingGlassIcon,
  PlusIcon,
} from "@heroicons/react/20/solid";
import Routes from "../../../Routes";
import Group from "@italodeandra/ui/components/Group/Group";
import Input from "@italodeandra/ui/components/Input/Input";
import { drop, map, orderBy, take } from "lodash";
import {
  AccountListApiResponse,
  useAccountList,
} from "../../../pages/api/account/list";
import Badge from "@italodeandra/ui/components/Badge/Badge";
import Stack from "@italodeandra/ui/components/Stack/Stack";
import Text from "@italodeandra/ui/components/Text";
import { useAccountTagGetUserTags } from "../../../pages/api/account-tag/get-user-tags";
import Checkbox from "@italodeandra/ui/components/Checkbox";
import { state } from "../../state";
import { useSnapshot } from "valtio";
import { useAccountDeleteMany } from "../../../pages/api/account/delete-many";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { BackupButton } from "./BackupButton";
import { OpenInBrowserButton } from "./OpenInBrowserButton";
import { AccountFixedButton } from "./AccountFixedButton";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import Tooltip from "@italodeandra/ui/components/Tooltip/Tooltip";
import { useAuthGetFullUser } from "@italodeandra/auth/api/getFullUser";
import dayjs from "dayjs";

export default function AccountsView() {
  let router = useRouter();
  let { data, isFetching, isError, refetch } = useAccountList();
  let [search, setSearch] = useState("");
  let [sort, setSort] = useState<[string, "asc" | "desc"][]>([]);
  let [selectedTags, setSelectedTags] = useState<string[]>([]);
  let [filterError, setFilterError] = useState(false);
  let [page, setPage] = useState(1);

  let { data: user } = useAuthGetFullUser();
  let expirationDate =
    user?.customData?.expirationDate && dayjs(user.customData.expirationDate);
  let isExpired = expirationDate && expirationDate.isBefore(dayjs());

  let { data: tags } = useAccountTagGetUserTags();
  let { selectedAccounts } = useSnapshot(state);

  let sortedData = useMemo(
    () =>
      orderBy(
        data
          ?.filter(
            (a) =>
              !selectedTags.length ||
              selectedTags.some((tag) => a.tags.includes(tag))
          )
          .filter(
            (a) =>
              (!search ||
                a.name.toLowerCase().includes(search.toLowerCase()) ||
                a.id?.toLowerCase().includes(search.toLowerCase())) &&
              (!filterError || !!a.error)
          ),
        map(sort, 0),
        map(sort, 1)
      ),
    [data, filterError, search, selectedTags, sort]
  );

  let allSelected = useMemo(
    () =>
      sortedData?.every((a) => selectedAccounts.includes(a._id) || !!a.error) ||
      false,
    [sortedData, selectedAccounts]
  );

  let columns = useMemo<DataTableProps<AccountListApiResponse[0]>["columns"]>(
    () => [
      {
        // headerClassName: "bg-zinc-200 z-20",
        title: (
          <Checkbox
            checked={allSelected}
            onChange={(e) => {
              if (e.target.checked) {
                state.selectedAccounts = [
                  ...state.selectedAccounts.filter(
                    (a) => !sortedData?.map((a) => a._id).includes(a)
                  ),
                  ...(sortedData.filter((a) => !a.error).map((a) => a._id) ||
                    []),
                ];
              } else {
                state.selectedAccounts = [
                  ...state.selectedAccounts.filter(
                    (a) => !sortedData?.map((a) => a._id).includes(a)
                  ),
                ];
              }
            }}
            label={selectedAccounts.length}
          />
        ),
        render: (item) =>
          item.error ? (
            <Tooltip content="Conta com erro">
              <ExclamationTriangleIcon className="h-4 w-4 text-error-500" />
            </Tooltip>
          ) : (
            <Checkbox
              onClick={(e) => e.stopPropagation()}
              checked={selectedAccounts.includes(item._id)}
              onChange={(e) => {
                if (e.target.checked) {
                  state.selectedAccounts = [
                    ...selectedAccounts.filter((a) => a !== item._id),
                    item._id,
                  ];
                } else {
                  state.selectedAccounts = [
                    ...selectedAccounts.filter((a) => a !== item._id),
                  ];
                }
              }}
            />
          ),
      },
      {
        id: "name",
        title: "Perfil",
        accessor: "name",
        sortable: true,
      },
      {
        id: "mainAccount",
        title: "Conta primária",
        accessor: "mainAccount",
        sortable: true,
      },
      {
        title: "Etiqueta",
        render: ({ tags }) => (
          <Group wrap className="-my-0.5">
            {tags.map((tag, i) => (
              <Badge key={i}>{tag}</Badge>
            ))}
          </Group>
        ),
      },
      {
        title: "Erro",
        accessor: "error",
        cellClassName: "!text-error-500",
      },
      {
        title: "",
        render: (account) => (
          <Group className="-my-0.5 justify-end">
            {!isExpired && account.error && (
              <AccountFixedButton account={account} />
            )}
            {!isExpired && <OpenInBrowserButton account={account} />}
          </Group>
        ),
      },
    ],
    [allSelected, selectedAccounts, sortedData, isExpired]
  );

  let handleRowClick = useCallback(
    (item: AccountListApiResponse[0]) =>
      router.push(Routes.PanelAccount(item._id)),
    [router]
  );

  let pages = useMemo(() => [{ title: "Perfis" }], []);

  let { mutate: deleteMany, isLoading: isDeletingMany } = useAccountDeleteMany({
    onSuccess() {
      state.selectedAccounts = [];
    },
  });

  let paginatedData = useMemo(
    () => take(drop(sortedData, (page - 1) * 30), 30),
    [page, sortedData]
  );

  return (
    <div className="flex flex-1 flex-col md:px-2 md:pb-2">
      <NextSeo title={pages[0].title} />
      <Group>
        <Breadcrumbs pages={pages} className="mb-2" />
        <Text variant="secondary" className="my-auto ml-auto">
          Limite: {data?.length || 0}/{user?.customData?.accountLimit || 1}
        </Text>
      </Group>

      <Stack className="mb-2">
        <Group className="z-10 items-end px-4 md:flex-row md:px-0">
          <Input
            leading={<MagnifyingGlassIcon className="h-5 w-5" />}
            placeholder="Pesquisar por nome ou ID"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full"
            type="search"
          />
          <Group className="ml-auto mt-auto w-full md:w-auto">
            <BackupButton />
            <Button
              href={Routes.PanelImportAccounts}
              leading={<ArrowUpTrayIcon />}
              disabled={
                (data?.length || 0) >= (user?.customData?.accountLimit || 1)
              }
            >
              Importar
            </Button>
            <Button
              href={Routes.PanelNewAccount}
              leading={<PlusIcon />}
              disabled={
                (data?.length || 0) >= (user?.customData?.accountLimit || 1)
              }
            >
              Novo
            </Button>
          </Group>
        </Group>
        {(!!tags?.length || !!selectedAccounts.length) && (
          <Group wrap className="items-center gap-4">
            {!!tags?.length && (
              <Group wrap className="items-center">
                <Text variant="label">Filtrar</Text>
                {tags.map((tag) => (
                  <Button
                    size="sm"
                    key={tag}
                    variant={selectedTags.includes(tag) ? "filled" : undefined}
                    color={selectedTags.includes(tag) ? "primary" : undefined}
                    onClick={() => {
                      if (selectedTags.includes(tag)) {
                        void setSelectedTags([
                          ...selectedTags.filter((s) => s !== tag),
                        ]);
                      } else {
                        void setSelectedTags([
                          ...selectedTags.filter((s) => s !== tag),
                          tag,
                        ]);
                      }
                    }}
                  >
                    {tag}
                  </Button>
                ))}
              </Group>
            )}
            <Button
              size="sm"
              variant={filterError ? "filled" : undefined}
              color={filterError ? "primary" : undefined}
              onClick={() => {
                setFilterError(!filterError);
              }}
            >
              Com Erro
            </Button>
            <div className="flex-grow" />
            {!!selectedAccounts.length && (
              <Group wrap className="items-center">
                <Text variant="label">Ações</Text>
                <Button size="sm" href={Routes.UpdateTag}>
                  Alterar etiqueta
                </Button>
                <DropdownMenu.Root>
                  <DropdownMenu.Trigger asChild>
                    <Button color="error" size="sm" loading={isDeletingMany}>
                      Excluir {selectedAccounts.length} selecionados
                    </Button>
                  </DropdownMenu.Trigger>

                  <DropdownMenu.Portal>
                    <DropdownMenu.Content
                      className="data-[side=bottom]:animate-slideUpAndFade data-[side=left]:animate-slideRightAndFade data-[side=right]:animate-slideLeftAndFade data-[side=top]:animate-slideDownAndFade min-w-[144px] rounded-md border border-zinc-100 bg-white p-[5px] shadow-[0px_4px_12px_0px_rgba(108,115,127,0.16)] will-change-[opacity,transform]"
                      align="end"
                    >
                      <DropdownMenu.Label className="px-3 text-xs leading-[25px]">
                        Você tem certeza que deseja excluir os perfis?
                      </DropdownMenu.Label>
                      <DropdownMenu.Item
                        onSelect={() => {
                          deleteMany({
                            _ids: selectedAccounts as string[],
                          });
                        }}
                        className="group relative flex h-[38px] select-none items-center gap-[10px] rounded-[6px] px-[12px] text-sm font-medium leading-none text-red-500 outline-none data-[disabled]:pointer-events-none data-[highlighted]:bg-zinc-100"
                      >
                        Excluir
                      </DropdownMenu.Item>
                      <DropdownMenu.Item className="group relative flex h-[38px] select-none items-center gap-[10px] rounded-[6px] px-[12px] text-sm font-medium leading-none text-black outline-none data-[disabled]:pointer-events-none data-[highlighted]:bg-zinc-100">
                        Cancelar
                      </DropdownMenu.Item>
                    </DropdownMenu.Content>
                  </DropdownMenu.Portal>
                </DropdownMenu.Root>
              </Group>
            )}
          </Group>
        )}
      </Stack>

      <DataTable
        className="flex flex-1 flex-col"
        columns={columns}
        data={paginatedData}
        isLoading={isFetching}
        onRowClick={handleRowClick}
        autoHeight
        noRecords={
          !isFetching && isError ? (
            <Alert
              title="Ocorreu um erro inesperado tentando listar as contas"
              variant="error"
              className="m-2"
              actions={
                <Button variant="text" color="error" onClick={() => refetch()}>
                  Tentar novamente
                </Button>
              }
            />
          ) : (
            "Nenhuma conta encontrada"
          )
        }
        sort={sort}
        onChangeSort={setSort}
        pagination
        totalItems={sortedData?.length}
        currentPage={page}
        itemsPerPage={30}
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
