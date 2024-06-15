import {
  ChatBubbleBottomCenterTextIcon,
  ChevronUpIcon,
  Cog8ToothIcon,
  HomeIcon,
  LockClosedIcon,
  PlayCircleIcon,
  QueueListIcon,
  ShareIcon,
  UsersIcon,
} from "@heroicons/react/24/solid";
import { ReactNode } from "react";
import NavigationItem from "@italodeandra/ui/components/NavigationDrawer/NavigationItem";
import Routes from "../../Routes";
import { checkUserType } from "@italodeandra/auth/collections/user/User.service";
import { UserType } from "@italodeandra/auth/collections/user/User";
import { Disclosure } from "@headlessui/react";
import clsx from "clsx";
import Button from "@italodeandra/ui/components/Button/Button";
import { useSnapshot } from "valtio";
import { state } from "../state";
import { useAuthGetFullUser } from "@italodeandra/auth/api/getFullUser";
import dayjs from "dayjs";
import dynamic from "next/dynamic";

const UiNavigationDrawer = dynamic(
  () => import("@italodeandra/ui/components/NavigationDrawer/NavigationDrawer"),
  { ssr: false }
);

export default function NavigationDrawer({
  children,
}: {
  children: ReactNode;
}) {
  let { data: user } = useAuthGetFullUser();
  let { selectedAccounts } = useSnapshot(state);

  let isAdmin = checkUserType(user, [UserType.ADMIN]);
  let isPremium = checkUserType(user, [UserType.PREMIUM, UserType.ADMIN]);

  let expirationDate =
    user?.customData?.expirationDate && dayjs(user.customData.expirationDate);
  let isExpired = expirationDate && expirationDate.isBefore(dayjs());

  return (
    <UiNavigationDrawer
      navigationChildren={
        <>
          {!!user && (
            <>
              <NavigationItem icon={<HomeIcon />} href={Routes.Home} exact>
                Início
              </NavigationItem>
              {!isExpired && isPremium && (
                <>
                  <Disclosure>
                    {({ open }) => (
                      <>
                        <Disclosure.Button
                          as={Button}
                          variant="text"
                          className={clsx(
                            "w-full !justify-start !border-transparent"
                          )}
                          leading={<PlayCircleIcon className="mr-3" />}
                        >
                          Robôs
                          <ChevronUpIcon
                            className={`${
                              open ? "rotate-180 transform" : ""
                            } ml-auto h-5 w-5`}
                          />
                        </Disclosure.Button>
                        <Disclosure.Panel
                          className={clsx({
                            "ml-2": open,
                          })}
                        >
                          <NavigationItem
                            href={Routes.PanelBotPostComments}
                            icon={<ChatBubbleBottomCenterTextIcon />}
                          >
                            Postar comentários / Curtir
                          </NavigationItem>
                          <NavigationItem
                            href={Routes.PanelBotShareOnGroup}
                            icon={<ShareIcon />}
                          >
                            Compartilhar em grupo
                          </NavigationItem>
                        </Disclosure.Panel>
                      </>
                    )}
                  </Disclosure>
                  {/*{user._id === "64c71b3771e7d70b46470436" && (
                <Disclosure>
                  {({ open }) => (
                    <>
                      <Disclosure.Button
                        as={Button}
                        variant="text"
                        className={clsx(
                          "w-full !justify-start !border-transparent"
                        )}
                        leading={<PlayCircleIcon className="mr-3" />}
                      >
                        Robôs (GraphQL)
                        <ChevronUpIcon
                          className={`${
                            open ? "rotate-180 transform" : ""
                          } ml-auto h-5 w-5`}
                        />
                      </Disclosure.Button>
                      <Disclosure.Panel
                        className={clsx({
                          "ml-2": open,
                        })}
                      >
                        <NavigationItem
                          href={Routes.PanelBotPostCommentsGql}
                          icon={<ChatBubbleBottomCenterTextIcon />}
                        >
                          Postar comentários (GraphQL)
                        </NavigationItem>
                        <NavigationItem
                          href={Routes.PanelBotShareOnGroupGql}
                          icon={<ShareIcon />}
                        >
                          Compartilhar em grupo (GraphQL)
                        </NavigationItem>
                      </Disclosure.Panel>
                    </>
                  )}
                </Disclosure>
              )}*/}
                </>
              )}
              <NavigationItem href={Routes.PanelAccounts} icon={<UsersIcon />}>
                Perfis
                {!!selectedAccounts.length && (
                  <div className="ml-auto rounded bg-primary-400 px-1.5 text-center text-white">
                    {selectedAccounts.length}
                  </div>
                )}
              </NavigationItem>
              {!isExpired && isPremium && (
                <>
                  <NavigationItem
                    href={Routes.PanelQueue}
                    icon={<QueueListIcon />}
                  >
                    Fila
                  </NavigationItem>
                  <NavigationItem
                    href={Routes.PanelSettings}
                    icon={<Cog8ToothIcon />}
                  >
                    Configurações
                  </NavigationItem>
                </>
              )}
            </>
          )}
          {isAdmin && (
            <>
              <NavigationItem
                href={Routes.PanelUsers}
                alternativeActiveHrefs={[Routes.PanelUser("")]}
                icon={<LockClosedIcon />}
              >
                Usuários
              </NavigationItem>
            </>
          )}
        </>
      }
    >
      {children}
    </UiNavigationDrawer>
  );
}
