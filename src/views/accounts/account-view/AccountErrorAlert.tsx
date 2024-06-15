import { AccountGetApiResponse } from "../../../pages/api/account/get";
import { useAccountUpdate } from "../../../pages/api/account/update";
import { showNotification } from "@italodeandra/ui/components/Notifications/notifications.state";
import Alert from "@italodeandra/ui/components/Alert/Alert";
import Button from "@italodeandra/ui/components/Button/Button";

export function AccountErrorAlert({
  account,
}: {
  account: AccountGetApiResponse;
}) {
  let { mutate: update, isLoading: isUpdating } = useAccountUpdate({
    onError(err) {
      console.error(err);
      showNotification({
        title: "Não foi possível alterar o perfil.",
        message: "Ocorreu um erro inesperado.",
        icon: "error",
      });
    },
  });

  let handleFixedClick = () => {
    update({
      _id: account._id,
      error: "",
    });
  };

  return (
    <Alert
      variant="error"
      title="Esta conta está com erro e não será utilizada pelo bot"
      actions={
        <Button
          variant="filled"
          color="success"
          loading={isUpdating}
          onClick={handleFixedClick}
        >
          Clique aqui se o erro foi corrigido
        </Button>
      }
    >
      {account.error}
    </Alert>
  );
}
