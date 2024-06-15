import Group from "@italodeandra/ui/components/Group/Group";
import ConfirmationButton from "@italodeandra/ui/components/ConfirmationButton/ConfirmationButton";
import Button from "@italodeandra/ui/components/Button/Button";
import { useForm } from "react-hook-form";
import { AccountFieldValues } from "./AccountFieldValues";
import { useEffect } from "react";
import { showNotification } from "@italodeandra/ui/components/Notifications/notifications.state";
import Routes from "../../../Routes";
import { useDeepCompareEffect } from "react-use";
import { useRouter } from "next/router";
import { AccountGetApiResponse } from "../../../pages/api/account/get";
import { useAccountCreate } from "../../../pages/api/account/create";
import { useAccountDelete } from "../../../pages/api/account/delete";
import { useAccountUpdate } from "../../../pages/api/account/update";
import Textarea from "@italodeandra/ui/components/Textarea/Textarea";
import Stack from "@italodeandra/ui/components/Stack/Stack";
import {
  ArrowPathIcon,
  ArrowTopRightOnSquareIcon,
} from "@heroicons/react/20/solid";
import { useAgentAccountConnect } from "../../../pages/api/agent/account-connect";
import Input from "@italodeandra/ui/components/Input/Input";
import { useAgent } from "../../useAgent";
import Alert from "@italodeandra/ui/components/Alert/Alert";
import { useAgentAccountOpen } from "../../../pages/api/agent/account-open";
import { useAuthGetFullUser } from "@italodeandra/auth/api/getFullUser";
import dayjs from "dayjs";

export function AccountForm({
  account,
  isLoading,
}: {
  account?: AccountGetApiResponse;
  isLoading: boolean;
}) {
  let router = useRouter();

  let { data: user } = useAuthGetFullUser();
  let expirationDate =
    user?.customData?.expirationDate && dayjs(user.customData.expirationDate);
  let isExpired = expirationDate && expirationDate.isBefore(dayjs());

  let _id = router.query.id as string;
  let isNew = ["novo", "nova", "new"].includes(_id);

  let form = useForm<AccountFieldValues>({
    defaultValues: {},
  });
  let {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = form;

  let agent = useAgent();
  let { mutate: connect, isLoading: isConnecting } = useAgentAccountConnect({
    onSuccess(data) {
      setValue(
        "facebookCookies",
        JSON.stringify(data.facebookCookies, null, 2)
      );
      if (!watch("id")) {
        setValue("id", data.id);
      }
      if (!watch("name")) {
        setValue("name", data.name);
      }
      showNotification({
        icon: "success",
        message: "Cookies atualizados",
        timeout: "5s",
      });
    },
    onError(error) {
      let errorMessage = error.message;
      if (
        errorMessage.includes(
          "Target page, context or browser has been closed"
        ) ||
        errorMessage.includes("Navigation failed because page was closed!")
      ) {
        errorMessage = "O navegador foi fechado manualmente.";
      }
      showNotification({
        icon: "error",
        title: "Não foi possível pegar os cookies do perfil.",
        message: errorMessage,
      });
      console.error(JSON.stringify(error, null, 2));
    },
  });
  let { mutate: open, isLoading: isOpening } = useAgentAccountOpen({
    onError(error) {
      showNotification({
        icon: "error",
        message: "Não foi possível abrir o perfil",
      });
      console.error(JSON.stringify(error, null, 2));
    },
  });

  useEffect(() => {
    if (account) {
      reset({
        ...account,
        facebookCookies: JSON.stringify(account.facebookCookies, null, 2),
        browserCookies: JSON.stringify(account.browserCookies, null, 2),
      });
    } else {
      reset();
    }
  }, [reset, account]);

  let {
    mutate: update,
    isLoading: isUpdating,
    isSuccess: isUpdated,
    reset: resetUpdate,
  } = useAccountUpdate({
    onError(err) {
      console.error(err);
      showNotification({
        title: "Não foi possível alterar o perfil.",
        message: "Ocorreu um erro inesperado.",
        icon: "error",
      });
    },
  });
  let {
    mutate: create,
    isLoading: isCreating,
    isSuccess: isCreated,
    reset: resetCreate,
  } = useAccountCreate({
    onSuccess(data) {
      void router.push(Routes.PanelAccount(data._id));
    },
    onError(err) {
      if (err.code === 409) {
        showNotification({
          title: "Não foi possível criar o perfil.",
          message: "Este perfil já existe.",
          icon: "error",
        });
        return;
      }
      console.error(err);
      showNotification({
        title: "Não foi possível criar o perfil.",
        message: "Ocorreu um erro inesperado.",
        icon: "error",
      });
    },
  });
  let { mutate: deletee, isLoading: isDeleting } = useAccountDelete({
    async onSuccess() {
      await router.replace(Routes.PanelAccounts);
      showNotification({
        message: `Perfil "${watch("name")}" excluído`,
        timeout: "5s",
      });
    },
    onError(err) {
      console.error(err);
      showNotification({
        title: "Não foi possível excluir o perfil.",
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
  let isSaved = isUpdated || isCreated;
  let isLoadingFields = !isNew && isLoading;

  async function onSubmit(values: AccountFieldValues) {
    if (!isSubmitting) {
      if (!isNew) {
        void update({
          _id,
          ...values,
          facebookCookies: values.facebookCookies
            ? JSON.parse(values.facebookCookies)
            : undefined,
          browserCookies: values.browserCookies
            ? JSON.parse(values.browserCookies)
            : undefined,
          mainAccountId: account?.mainAccountId,
        });
      } else {
        void create({
          ...values,
          facebookCookies: values.facebookCookies
            ? JSON.parse(values.facebookCookies)
            : undefined,
          browserCookies: values.browserCookies
            ? JSON.parse(values.browserCookies)
            : undefined,
        });
      }
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-4 px-2 sm:grid sm:grid-cols-2 md:px-0"
    >
      <Stack className="col-span-2">
        {account?.mainAccountId && (
          <Button href={Routes.PanelAccount(account.mainAccountId)}>
            Ver conta primária
          </Button>
        )}
        {!isExpired && isNew && (
          <Button
            variant="filled"
            color="primary"
            leading={<ArrowPathIcon />}
            disabled={agent === "unavailable"}
            loading={isConnecting}
            onClick={() => {
              connect({
                accountId: account?._id,
              });
            }}
          >
            Pegar cookies
          </Button>
        )}
        {!isExpired && account && (
          <Button
            variant="filled"
            color="primary"
            leading={<ArrowTopRightOnSquareIcon />}
            disabled={agent === "unavailable"}
            loading={isOpening}
            onClick={() => {
              open({
                accountId: account._id,
              });
            }}
          >
            Abrir no navegador
          </Button>
        )}
        {!isLoading && !isNew && account?.version !== 2 && (
          <Alert
            variant="error"
            title="Esta conta não está atualizada para utilizar essa versão"
          >
            <Stack>
              <div>
                Para atualizar a conta, você terá que pegar os cookies
                novamente.
              </div>
              <Button
                variant="filled"
                color="success"
                onClick={() => {
                  connect({
                    accountId: account?._id,
                  });
                }}
                disabled={agent === "unavailable"}
                leading={<ArrowPathIcon />}
              >
                Atualizar cookies
              </Button>
            </Stack>
          </Alert>
        )}
        <Input
          label="Nome"
          {...register("name", { required: "Preencher o nome" })}
          loading={isLoading}
          required
          error={!!errors.name}
          helpText={errors.name?.message}
        />
        <Input
          label="ID"
          {...register("id")}
          loading={isLoading}
          error={!!errors.id}
          helpText={errors.id?.message}
          readOnly={!isNew}
        />
        <Textarea
          label="Facebook Cookies"
          {...register("facebookCookies")}
          loading={isLoading}
          error={!!errors.facebookCookies}
          helpText={errors.facebookCookies?.message}
          maxRows={10}
          readOnly={!isNew}
        />
        <Textarea
          label="Browser Cookies"
          {...register("browserCookies")}
          loading={isLoading}
          maxRows={10}
          readOnly
        />
        <Textarea
          label="Notas"
          {...register("notes")}
          loading={isLoading}
          maxRows={10}
        />
      </Stack>
      <Group className="col-span-2 w-full flex-col-reverse border-t border-gray-200 pt-4 dark:border-zinc-800 sm:flex-row">
        <div style={{ flexGrow: 1 }}></div>

        {!isNew && (
          <ConfirmationButton
            label="Excluir"
            confirmation="Você tem certeza que deseja excluir a conta?"
            onConfirm={() => deletee({ _id })}
            loading={isDeleting}
            className="w-full sm:w-[auto]"
            cancel="Cancelar"
            position="bottom-right"
          />
        )}
        {!isSaved ? (
          <Button
            type="submit"
            loading={isSubmitting || isLoadingFields}
            variant="filled"
            color="primary"
            className="w-full sm:w-[auto]"
          >
            Salvar
          </Button>
        ) : (
          <Button
            type="submit"
            loading={isSubmitting || isLoadingFields}
            variant="filled"
            color="success"
            className="w-full sm:w-[auto]"
          >
            Salvo
          </Button>
        )}
      </Group>
    </form>
  );
}
