import Button from "@italodeandra/ui/components/Button/Button";
import { IAccount } from "../../../collections/Account";
import Jsonify from "@italodeandra/next/utils/Jsonify";
import { useAccountUpdate } from "../../../pages/api/account/update";
import { showNotification } from "@italodeandra/ui/components/Notifications/notifications.state";

export function AccountFixedButton({
  account,
}: {
  account: Pick<Jsonify<IAccount>, "_id" | "tabs" | "version">;
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
    <Button
      color="success"
      size="xs"
      onClick={(e) => {
        e.stopPropagation();
        handleFixedClick();
      }}
      loading={isUpdating}
    >
      Marcar como corrigido
    </Button>
  );
}
