import { useMemo, useState } from "react";
import { NextSeo } from "next-seo";
import { useRouter } from "next/router";
import Breadcrumbs from "@italodeandra/ui/components/Breadcrumbs/Breadcrumbs";
import Routes from "../../../Routes";
import { AccountForm } from "./AccountForm";
import Stack from "@italodeandra/ui/components/Stack/Stack";
import { useAccountGet } from "../../../pages/api/account/get";
import Group from "@italodeandra/ui/components/Group/Group";
import Button from "@italodeandra/ui/components/Button/Button";
import { AccountTags } from "./tags/AccountTags";
import { AccountPages } from "./AccountPages";
import { AccountErrorAlert } from "./AccountErrorAlert";
import { AccountGroupsTab } from "./groups/AccountGroupsTab";

export default function AccountView() {
  let router = useRouter();
  let _id = router.query.id as string;
  let isNew = ["novo", "nova", "new"].includes(_id);
  let [tab, setTab] = useState(0);

  let {
    data: account,
    isLoading,
    isFetching,
  } = useAccountGet(
    !isNew
      ? {
          _id,
        }
      : undefined
  );

  isLoading = isLoading && !isNew;

  let title = isNew ? "Nova conta" : account?.name || "Conta";

  let pages = useMemo(
    () => [
      { title: "Perfis", href: Routes.PanelAccounts },
      { title, loading: !isNew && isLoading },
    ],
    [isLoading, isNew, title]
  );

  return (
    <div className="flex flex-1 flex-col pb-2 md:px-2">
      <NextSeo title={title} />
      <div className="mx-auto flex w-full max-w-screen-lg flex-1 flex-col">
        <Breadcrumbs
          pages={pages}
          className="col-span-2 mb-4"
          loading={isFetching}
        />
        <Stack className="flex-1 gap-3">
          {account?.error && <AccountErrorAlert account={account} />}
          {!isNew ? (
            <>
              <Group className="mr-auto rounded-lg bg-gray-200 p-2">
                <Button
                  variant={tab === 0 ? "filled" : "text"}
                  color={tab === 0 ? "primary" : undefined}
                  onClick={() => setTab(0)}
                  disabled={isLoading}
                >
                  Informações
                </Button>
                {account?.facebookCookies && (
                  <>
                    <Button
                      variant={tab === 1 ? "filled" : "text"}
                      color={tab === 1 ? "primary" : undefined}
                      onClick={() => setTab(1)}
                      disabled={isLoading}
                    >
                      Grupos
                    </Button>
                    {!account?.mainAccountId && (
                      <Button
                        variant={tab === 2 ? "filled" : "text"}
                        color={tab === 2 ? "primary" : undefined}
                        onClick={() => setTab(2)}
                        disabled={isLoading}
                      >
                        Páginas
                      </Button>
                    )}
                  </>
                )}
                <Button
                  variant={tab === 3 ? "filled" : "text"}
                  color={tab === 3 ? "primary" : undefined}
                  onClick={() => setTab(3)}
                  disabled={isLoading}
                >
                  Etiquetas
                </Button>
              </Group>
              {tab === 0 && (
                <AccountForm account={account} isLoading={isLoading} />
              )}
              {tab === 1 && account && <AccountGroupsTab account={account} />}
              {tab === 2 && account && <AccountPages account={account} />}
              {tab === 3 && account && <AccountTags accountId={account._id} />}
            </>
          ) : (
            <AccountForm account={account} isLoading={isLoading} />
          )}
        </Stack>
      </div>
    </div>
  );
}
