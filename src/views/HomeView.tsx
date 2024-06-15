import { useAuthGetFullUser } from "@italodeandra/auth/api/getFullUser";
import Stack from "@italodeandra/ui/components/Stack/Stack";
import dayjs from "dayjs";

export function HomeView() {
  let { data: user } = useAuthGetFullUser();
  let expirationDate =
    user?.customData?.expirationDate && dayjs(user.customData.expirationDate);
  return (
    <Stack className="p-4 pt-0">
      <div>Seja bem-vindo.</div>
      {expirationDate && expirationDate.isAfter(dayjs()) && (
        <div>Seu plano irá expirar em {expirationDate.fromNow()}.</div>
      )}
    </Stack>
  );
}
