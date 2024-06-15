import { useAuthGetFullUser } from "@italodeandra/auth/api/getFullUser";
import dayjs from "dayjs";
import Alert from "@italodeandra/ui/components/Alert/Alert";

export function Expiration() {
  let { data: user } = useAuthGetFullUser();
  let expirationDate =
    user?.customData?.expirationDate && dayjs(user.customData.expirationDate);

  return (
    <div className="m-2 mt-0">
      {expirationDate && expirationDate.isBefore(dayjs()) && (
        <Alert variant="error" title="Seu plano expirou." />
      )}
    </div>
  );
}
