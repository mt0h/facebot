import Text from "@italodeandra/ui/components/Text/Text";
import { NewTag } from "./NewTag";
import Stack from "@italodeandra/ui/components/Stack/Stack";
import { TagForm } from "./TagForm";
import { useAccountTagList } from "../../../../pages/api/account-tag/list";
import Loading from "@italodeandra/ui/components/Loading/Loading";

export function AccountTags({ accountId }: { accountId: string }) {
  let { data: tags, isLoading } = useAccountTagList({
    accountId,
  });

  return (
    <>
      <Stack>
        {isLoading && <Loading />}
        {!isLoading && !tags?.length && (
          <Text variant="secondary">Nenhuma etiqueta</Text>
        )}
        {tags?.map((tag) => (
          <TagForm
            tag={tag}
            key={tag._id}
            accountId={accountId}
            excludeLabels={tags
              ?.filter((t) => t._id !== tag._id)
              .map((t) => t.label)}
          />
        ))}
      </Stack>
      {!tags?.length && (
        <NewTag
          accountId={accountId}
          excludeLabels={tags?.map((t) => t.label)}
        />
      )}
    </>
  );
}
