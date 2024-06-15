import { showNotification } from "@italodeandra/ui/components/Notifications/notifications.state";
import { ChangeEvent, useMemo, useState } from "react";
import Button from "@italodeandra/ui/components/Button/Button";
import { ArrowUpTrayIcon } from "@heroicons/react/20/solid";
import { NextSeo } from "next-seo";
import Breadcrumbs from "@italodeandra/ui/components/Breadcrumbs/Breadcrumbs";
import Stack from "@italodeandra/ui/components/Stack/Stack";
import Textarea from "@italodeandra/ui/components/Textarea/Textarea";
import Text from "@italodeandra/ui/components/Text";
import { useAgentAccountImport } from "../pages/api/agent/account-import";
import Alert from "@italodeandra/ui/components/Alert/Alert";
import { find, omit } from "lodash";
import MultiSelect from "@italodeandra/ui/components/MultiSelect";
import { useAccountTagGetUserTags } from "../pages/api/account-tag/get-user-tags";
import { useAgent } from "./useAgent";

export function ImportAccountsView() {
  let [foundAccounts, setFoundAccounts] = useState<
    {
      name?: string;
      notes: string;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      facebookCookies: any;
    }[]
  >([]);
  let {
    mutate: importAccounts,
    isLoading: isSubmitting,
    isSuccess: isSaved,
    data: importData,
  } = useAgentAccountImport({
    onSuccess(data) {
      if (!data.errors.length) {
        showNotification({
          message: "Todos os perfis foram importados.",
          icon: "success",
          timeout: "5s",
        });
      } else {
        showNotification({
          title: "Nem todos os perfis foram importados.",
          message: `${data.errors.length} perfi${
            data.errors.length === 1 ? "l" : "s"
          } de${data.errors.length === 1 ? "u" : "ram"} erro.`,
          icon: "error",
        });
      }
    },
    onError() {
      showNotification({
        message: "Não foi possível importar os perfis.",
        icon: "error",
      });
    },
  });
  let [newTags, setNewTags] = useState<string[]>([]);
  let { data: tags, isLoading: isLoadingTags } = useAccountTagGetUserTags();
  let agent = useAgent();

  let upload = async (event: ChangeEvent<HTMLInputElement>) => {
    let accounts: typeof foundAccounts = [...foundAccounts];

    for (let file of Array.from(event.target.files || [])) {
      if (file) {
        const reader = new FileReader();

        await new Promise<void>((resolve) => {
          reader.onload = function (e) {
            const contents = e.target?.result as string;

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            let json: any;

            try {
              json = JSON.parse(contents);
            } catch (e) {
              // do nothing
            }

            if (json) {
              accounts.push(...json);
            } else {
              let read = "";

              for (let character of contents) {
                read = read + character;
                let regexResult = /\[[^[\]]*]/g.exec(read)?.[0];
                if (regexResult) {
                  try {
                    let facebookCookies = JSON.parse(regexResult);
                    accounts.push({
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      facebookCookies: facebookCookies.map((c: any) =>
                        omit(c, ["sameSite"])
                      ),
                      notes: read.replace(regexResult, ""),
                    });
                    read = "";
                  } catch (e) {
                    // do nothing
                  }
                }
              }
            }

            resolve();
          };

          reader.readAsText(file);
        });
      }
    }

    setFoundAccounts(accounts);
  };

  let pages = useMemo(() => [{ title: "Importar" }], []);

  let handleSaveClick = () => {
    if (!isSubmitting) {
      importAccounts({
        accounts: foundAccounts.map((a, index) => ({
          index,
          ...a,
        })),
        tags: newTags,
      });
    }
  };

  return (
    <div className="flex flex-1 flex-col md:px-2 md:pb-2">
      <NextSeo title={pages[0].title} />
      <div className="mx-auto flex w-full max-w-screen-lg flex-1 flex-col">
        <Breadcrumbs pages={pages} className="mb-2" />
        <Stack>
          <input
            type="file"
            id="file-input"
            className="hidden"
            onChange={upload}
            multiple
            accept="text/plain, application/json"
          />
          <div>
            <Button
              onClick={() =>
                document
                  .querySelector<HTMLButtonElement>("#file-input")
                  ?.click()
              }
              leading={<ArrowUpTrayIcon />}
              variant="filled"
              color="primary"
            >
              Carregar arquivos
            </Button>
          </div>
          {!!foundAccounts.length && (
            <>
              <Text>Perfis encontrados: {foundAccounts.length}</Text>
              {foundAccounts.map((account, index) => {
                let errorMessage = find(importData?.errors, {
                  index,
                })?.message;
                return (
                  <div key={index} className="grid grid-cols-2 gap-2">
                    <Text variant="label" className="col-span-2">
                      Perfil {account.name || index + 1}
                    </Text>
                    <Textarea
                      value={JSON.stringify(account.facebookCookies, null, 2)}
                      readOnly
                      maxRows={10}
                    />
                    <Textarea value={account.notes} readOnly maxRows={20} />
                    {errorMessage && (
                      <Alert
                        className="col-span-2"
                        variant="error"
                        key={index}
                        title={`Não foi possível salvar o Perfil ${index + 1}`}
                      >
                        {errorMessage}
                      </Alert>
                    )}
                  </div>
                );
              })}
              <MultiSelect
                label="Etiqueta"
                value={newTags}
                items={tags}
                creatable
                getCreateLabel={(label) => `+ criar "${label}"`}
                onChange={(items) => setNewTags(items)}
                loading={isLoadingTags}
              />
              <div className="flex justify-end">
                {!isSaved ? (
                  <Button
                    loading={isSubmitting}
                    variant="filled"
                    color="primary"
                    onClick={handleSaveClick}
                    disabled={agent === "unavailable"}
                  >
                    Salvar
                  </Button>
                ) : (
                  <Button
                    onClick={handleSaveClick}
                    loading={isSubmitting}
                    variant="filled"
                    color="success"
                    disabled={agent === "unavailable"}
                  >
                    Salvo
                  </Button>
                )}
              </div>
            </>
          )}
        </Stack>
      </div>
    </div>
  );
}
