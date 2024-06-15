import Group from "@italodeandra/ui/components/Group/Group";
import Button from "@italodeandra/ui/components/Button/Button";
import { useForm } from "react-hook-form";
import { showNotification } from "@italodeandra/ui/components/Notifications/notifications.state";
import Textarea from "@italodeandra/ui/components/Textarea/Textarea";
import Input from "@italodeandra/ui/components/Input/Input";
import { state } from "../../state";
import { useSnapshot } from "valtio";
import Alert from "@italodeandra/ui/components/Alert/Alert";
import { useBotShareOnGroup } from "../../../pages/api/bot/share-on-group";
import MultiSelect from "@italodeandra/ui/components/MultiSelect";
import { useAccountTagGetUserTags } from "../../../pages/api/account-tag/get-user-tags";
import { SwitchInput } from "@italodeandra/ui/components/Switch/Switch";
import dayjs from "dayjs";
import DateTimeInput from "@italodeandra/ui/components/DateInput/DateTimeInput";
import { useMount } from "react-use";
import { omit } from "lodash";

interface FieldValues {
  postUrl: string;
  description: string;
  tags: string[];
  schedule: boolean;
  date: string;
}

export function ShareOnGroupForm({ gql }: { gql?: boolean }) {
  let { selectedAccounts, botCopy } = useSnapshot(state);
  let form = useForm<FieldValues>({
    defaultValues: {
      tags: (botCopy.tags as FieldValues["tags"]) || [],
      date: new Date().toISOString(),
      ...omit(botCopy, ["tags"]),
    },
  });
  let {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = form;

  useMount(() => {
    state.botCopy = {};
  });

  let { mutate: postComments, isLoading: isCreating } = useBotShareOnGroup({
    onSuccess() {
      showNotification({
        message: "Compartilhamentos estão na fila para serem postados.",
        timeout: "5s",
      });
    },
    onError(err) {
      console.error(err);
      if (err.code === 400) {
        showNotification({
          title: "Não foi possível postar os compartilhamentos.",
          message:
            "Nenhum dos usuários selecionados tem pelo menos um grupo selecionado ou as etiquetas selecionadas.",
          icon: "error",
        });
      } else {
        showNotification({
          title: "Não foi possível postar os compartilhamentos.",
          message: "Ocorreu um erro inesperado.",
          icon: "error",
        });
      }
    },
  });

  let isSubmitting = isCreating;

  async function onSubmit(values: FieldValues) {
    if (!isSubmitting) {
      void postComments({
        gql,
        ...values,
        selectedAccounts: state.selectedAccounts,
        date: values.schedule ? values.date : new Date().toISOString(),
      });
    }
  }

  let { data: tags, isLoading: isLoadingTags } = useAccountTagGetUserTags();

  if (!selectedAccounts.length) {
    return (
      <Alert title="Selecione pelo menos uma conta para poder compartilhar em grupo." />
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-4 px-2 md:px-0"
    >
      <MultiSelect
        label="Etiquetas"
        value={watch("tags")}
        items={tags}
        onChange={(items) => setValue("tags", items)}
        loading={isLoadingTags}
        placeholder={!watch("tags").length ? "Todas etiquetas" : ""}
      />
      <Input
        label="Link URL"
        {...register("postUrl", {
          required: "Preencher com o link",
        })}
        required
        error={!!errors.postUrl}
        helpText={errors.postUrl?.message}
      />
      <Textarea
        label="Descrição"
        minRows={10}
        {...register("description")}
        helpText="Cada linha é uma descrição diferente"
      />
      <SwitchInput
        label="Agendar"
        rightLabel={
          watch("schedule")
            ? `Agendado para ${dayjs(watch("date")).format("LLL")}`
            : "Postar agora"
        }
        checked={watch("schedule")}
        onChange={(checked) => setValue("schedule", checked)}
        className="w-full"
      />
      {watch("schedule") && (
        <DateTimeInput
          label="Data do agendamento"
          {...register("date", {
            required: "Preencher com a data",
          })}
          required
          error={!!errors.date}
          helpText={errors.date?.message}
        />
      )}
      <Group className="col-span-2 w-full flex-col-reverse border-t border-gray-200 pt-4 dark:border-zinc-800 sm:flex-row">
        <div style={{ flexGrow: 1 }}></div>
        <Button
          type="submit"
          loading={isSubmitting}
          variant="filled"
          color="primary"
          className="w-full sm:w-[auto]"
        >
          {!watch("schedule") ? "Compartilhar" : "Agendar compartilhamento"} em
          grupo
          {gql && " (GraphQL)"}
        </Button>
      </Group>
    </form>
  );
}
