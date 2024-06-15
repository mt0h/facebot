import Group from "@italodeandra/ui/components/Group/Group";
import Button from "@italodeandra/ui/components/Button/Button";
import { useForm } from "react-hook-form";
import { showNotification } from "@italodeandra/ui/components/Notifications/notifications.state";
import Textarea from "@italodeandra/ui/components/Textarea/Textarea";
import Input from "@italodeandra/ui/components/Input/Input";
import { SwitchInput } from "@italodeandra/ui/components/Switch/Switch";
import { useBotPostComment } from "../../../pages/api/bot/post-comment";
import { state } from "../../state";
import { useSnapshot } from "valtio";
import Alert from "@italodeandra/ui/components/Alert/Alert";
import MultiSelect from "@italodeandra/ui/components/MultiSelect";
import { useAccountTagGetUserTags } from "../../../pages/api/account-tag/get-user-tags";
import DateTimeInput from "@italodeandra/ui/components/DateInput/DateTimeInput";
import dayjs from "dayjs";
import { useMount } from "react-use";
import { omit } from "lodash";

interface FieldValues {
  postUrl: string;
  comments: string;
  tags: string[];
  like: boolean;
  schedule: boolean;
  date: string;
}

export function PostCommentForm({ gql }: { gql?: boolean }) {
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

  let { mutate: postComments, isLoading: isCreating } = useBotPostComment({
    onSuccess() {
      showNotification({
        message: "Comentários estão na fila para serem postados.",
        timeout: "5s",
      });
    },
    onError(err) {
      console.error(err);
      if (err.code === 400) {
        showNotification({
          title: "Não foi possível postar os comentários.",
          message:
            "Nenhum dos usuários selecionados tem as etiquetas selecionadas.",
          icon: "error",
        });
      } else {
        showNotification({
          title: "Não foi possível postar os comentários.",
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
      <Alert title="Selecione pelo menos uma conta para poder postar comentário." />
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
        label="Post URL"
        {...register("postUrl", {
          required: "Preencher com a URL da postagem",
        })}
        required
        error={!!errors.postUrl}
        helpText={errors.postUrl?.message}
      />
      <Textarea
        label="Comentários"
        minRows={10}
        {...register("comments")}
        helpText="Cada linha é um comentário diferente"
      />
      <SwitchInput
        label="Curtir"
        rightLabel={watch("like") ? "Curtir" : "Não curtir"}
        checked={watch("like")}
        onChange={(checked) => setValue("like", checked)}
        className="w-full"
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
          {!watch("schedule") ? "Postar" : "Agendar"} comentários{" "}
          {gql && " (GraphQL)"}
        </Button>
      </Group>
    </form>
  );
}
