import Stack from "@italodeandra/ui/components/Stack/Stack";
import { NextSeo } from "next-seo";
import Breadcrumbs from "@italodeandra/ui/components/Breadcrumbs/Breadcrumbs";
import { useMemo, useState } from "react";
import Routes from "../../../Routes";
import MultiSelect from "@italodeandra/ui/components/MultiSelect";
import { useAccountTagGetUserTags } from "../../../pages/api/account-tag/get-user-tags";
import Button from "@italodeandra/ui/components/Button/Button";
import Group from "@italodeandra/ui/components/Group/Group";
import Text from "@italodeandra/ui/components/Text";
import { useSnapshot } from "valtio";
import { state } from "../../state";
import { useAccountTagUpdateMany } from "../../../pages/api/account-tag/update-many";
import { useRouter } from "next/router";

export function UpdateTagView() {
  let router = useRouter();
  let { selectedAccounts } = useSnapshot(state);
  let [newTags, setNewTags] = useState<string[]>([]);

  let { data: tags, isLoading: isLoadingTags } = useAccountTagGetUserTags();

  let pages = useMemo(
    () => [
      { title: "Perfis", href: Routes.PanelAccounts },
      { title: "Alterar etiqueta" },
    ],
    []
  );

  let { mutate: updateTag, isLoading: isUpdating } = useAccountTagUpdateMany({
    onSuccess() {
      void router.push(Routes.PanelAccounts);
    },
  });

  return (
    <div className="flex flex-1 flex-col md:px-2 md:pb-2">
      <NextSeo title={pages[0].title} />
      <div className="mx-auto flex w-full max-w-screen-lg flex-1 flex-col">
        <Breadcrumbs pages={pages} className="mb-2" />
        <Stack className="flex flex-1 flex-col">
          <Stack>
            <Text className="font-semibold">Alterando</Text>
            <Text>
              {selectedAccounts.length} perfi
              {selectedAccounts.length !== 1 ? "s" : "l"}
            </Text>
          </Stack>
          <MultiSelect
            label="Nova etiqueta"
            value={newTags}
            items={tags}
            creatable
            getCreateLabel={(label) => `+ criar "${label}"`}
            onChange={(items) => setNewTags(items[0] ? [items[0]] : [])}
            loading={isLoadingTags}
          />
          <Group>
            <Button
              type="submit"
              variant="filled"
              color="primary"
              className="w-full sm:w-[auto]"
              loading={isUpdating}
              onClick={() => {
                updateTag({
                  tags: newTags,
                  accountIds: selectedAccounts as string[],
                });
              }}
            >
              Salvar
            </Button>
          </Group>
        </Stack>
      </div>
    </div>
  );
}
