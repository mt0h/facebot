import Button from "@italodeandra/ui/components/Button";
import { ExclamationTriangleIcon, UserIcon } from "@heroicons/react/24/outline";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { useCallback } from "react";
import {
  setData_authGetUser,
  useAuthGetUser,
} from "@italodeandra/auth/api/getUser";
import Tooltip from "@italodeandra/ui/components/Tooltip";
import { deleteCookie } from "cookies-next";
import Routes from "../../Routes";
import authState, { useAuthSnapshot } from "@italodeandra/auth/auth.state";
import DropdownMenu from "@italodeandra/ui/components/DropdownMenu";
import Loading from "@italodeandra/ui/components/Loading";
import getInitials from "@italodeandra/ui/utils/getInitials";
import { useAuthPanelUserStopImpersonate } from "@italodeandra/auth/api/panel/user/stop-impersonate";

export default function UserMenu() {
  let queryClient = useQueryClient();
  let { token, previousToken } = useAuthSnapshot();
  let { data: user, isLoading: isLoadingUser, isError } = useAuthGetUser();
  let router = useRouter();
  let { mutate: stopImpersonate, isLoading: isStoppingImpersonate } =
    useAuthPanelUserStopImpersonate();

  let handleLogOutClick = useCallback(async () => {
    authState.token = null;
    deleteCookie("auth", { path: "/" });
    setData_authGetUser(queryClient, null);
    await router.replace(Routes.Home);
  }, [queryClient, router]);

  if (isError) {
    return (
      <Tooltip
        content="There was an unexpected error trying to get the logged in user data"
        delay={200}
      >
        <div className="flex h-[42px] w-[42px] items-center justify-center rounded-full bg-red-100">
          <ExclamationTriangleIcon className="w-6 text-red-500" />
        </div>
      </Tooltip>
    );
  }

  let isLoading = isStoppingImpersonate || (!!token && isLoadingUser);

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <Button className="rounded-full p-1.5 w-9 h-9">
          {isLoading ? (
            <Loading className="w-5 h-5" />
          ) : user ? (
            <span className="text-sm font-medium">
              {getInitials(user.name || user.email)}
            </span>
          ) : (
            <UserIcon className="w-5 h-5" />
          )}
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        {user ? (
          <>
            <DropdownMenu.Label title={user.email}>
              {user.name || user.email}
            </DropdownMenu.Label>
            {previousToken && (
              <DropdownMenu.Item onClick={() => stopImpersonate()}>
                Parar de impersonar
              </DropdownMenu.Item>
            )}
            <DropdownMenu.Item onClick={handleLogOutClick}>
              Sair
            </DropdownMenu.Item>
          </>
        ) : (
          <DropdownMenu.Item href={Routes.SignIn}>Entrar</DropdownMenu.Item>
        )}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}
