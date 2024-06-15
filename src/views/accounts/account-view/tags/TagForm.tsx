import Group from "@italodeandra/ui/components/Group/Group";
import Button from "@italodeandra/ui/components/Button/Button";
import { AccountTagListApiResponse } from "../../../../pages/api/account-tag/list";
import { useForm } from "react-hook-form";
import ConfirmationButton from "@italodeandra/ui/components/ConfirmationButton/ConfirmationButton";
import { showNotification } from "@italodeandra/ui/components/Notifications/notifications.state";
import { useAccountTagDelete } from "../../../../pages/api/account-tag/delete";
import { useAccountTagCreate } from "../../../../pages/api/account-tag/create";
import { useDeepCompareEffect } from "react-use";
import { useEffect } from "react";
import { useAccountTagUpdate } from "../../../../pages/api/account-tag/update";
import { useAccountTagGetUserTags } from "../../../../pages/api/account-tag/get-user-tags";
import MultiSelect from "@italodeandra/ui/components/MultiSelect";
import { last } from "lodash";
import { useAccountGroupList } from "../../../../pages/api/account-group/list";

interface FieldValues {
  label: string;
  groupsIds: string[];
}

export function TagForm({
  accountId,
  tag,
  onSave,
  excludeLabels,
}: {
  accountId: string;
  tag?: AccountTagListApiResponse[0];
  onSave?: () => void;
  excludeLabels?: string[];
}) {
  let { watch, reset, handleSubmit, setValue } = useForm<FieldValues>({
    defaultValues: {
      label: tag?.label || "",
    },
  });

  useEffect(() => {
    if (tag) {
      reset({
        ...tag,
      });
    } else {
      reset();
    }
  }, [reset, tag]);

  let { mutate: deletee, isLoading: isDeleting } = useAccountTagDelete({
    async onSuccess() {
      showNotification({
        message: `Etiqueta "${tag?.label}" excluída`,
        timeout: "5s",
      });
    },
    onError(err) {
      console.error(err);
      showNotification({
        title: "Não foi possível excluir a etiqueta.",
        message: "Ocorreu um erro inesperado.",
        icon: "error",
      });
    },
  });
  let {
    mutate: update,
    isLoading: isUpdating,
    reset: resetUpdate,
  } = useAccountTagUpdate({
    onSuccess() {
      onSave?.();
    },
    onError(err) {
      console.error(err);
      showNotification({
        title: "Não foi possível alterar a etiqueta.",
        message: "Ocorreu um erro inesperado.",
        icon: "error",
      });
    },
  });
  let {
    mutate: create,
    isLoading: isCreating,
    reset: resetCreate,
  } = useAccountTagCreate({
    onSuccess() {
      onSave?.();
    },
    onError(err) {
      console.error(err);
      showNotification({
        title: "Não foi possível criar a etiqueta.",
        message: "Ocorreu um erro inesperado.",
        icon: "error",
      });
    },
  });

  useDeepCompareEffect(() => {
    resetUpdate();
    resetCreate();
  }, [watch(), resetUpdate, resetCreate]);

  let isSubmitting = isUpdating || isCreating;

  async function onSubmit(values: FieldValues) {
    if (!values.label) {
      return;
    }
    if (!isSubmitting) {
      if (tag) {
        void update({
          _id: tag._id,
          ...values,
          accountId,
        });
      } else {
        void create({
          ...values,
          accountId,
        });
      }
    }
  }

  let { data: tags, isLoading: isLoadingTags } = useAccountTagGetUserTags();
  let { data: groups, isLoading: isLoadingGroups } = useAccountGroupList({
    accountId,
  });

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-2 rounded bg-white p-4 shadow"
    >
      <MultiSelect
        label="Etiqueta"
        value={watch("label") ? [watch("label")] : []}
        items={tags?.filter((tag) => !excludeLabels?.includes(tag))}
        creatable
        getCreateLabel={(label) => `+ criar "${label}"`}
        onChange={(items) => setValue("label", last(items) || "")}
        loading={isLoadingTags}
      />
      <MultiSelect
        label="Grupos"
        value={
          (groups &&
            (watch("groupsIds")
              ?.map((id) => groups?.find((g) => g._id === id))
              .filter(Boolean) as { name: string; _id: string }[])) ||
          []
        }
        filterProperty="name"
        renderProperty="name"
        items={groups}
        onChange={(items) =>
          setValue(
            "groupsIds",
            items.map((i) => i._id)
          )
        }
        loading={isLoadingGroups}
      />

      <Group className="col-span-2 w-full flex-col-reverse dark:border-zinc-800 sm:flex-row">
        <div style={{ flexGrow: 1 }}></div>
        {!!tag && (
          <ConfirmationButton
            label="Excluir"
            confirmation="Você tem certeza que deseja excluir a etiqueta?"
            onConfirm={() => deletee({ _id: tag._id })}
            loading={isDeleting}
            className="w-full sm:w-[auto]"
            cancel="Cancelar"
            position="bottom-right"
          />
        )}
        <Button
          type="submit"
          loading={isSubmitting}
          variant="filled"
          color="primary"
          className="w-full sm:w-[auto]"
        >
          Salvar
        </Button>
      </Group>
    </form>
  );
}
