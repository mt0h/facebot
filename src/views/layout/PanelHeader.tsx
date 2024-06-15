import UiHeader from "@italodeandra/ui/components/Header/Header";
import Button from "@italodeandra/ui/components/Button/Button";
import { Bars3BottomLeftIcon } from "@heroicons/react/24/solid";
import UserMenu from "./UserMenu";
import navigationDrawerState from "@italodeandra/ui/components/NavigationDrawer/navigationDrawer.state";
import NextLink from "next/link";
import Routes from "../../Routes";
import { useAgent } from "../useAgent";
import clsx from "clsx";
import Badge from "@italodeandra/ui/components/Badge/Badge";
import { AGENT_VERSION } from "../../constants";
import { useAuthGetFullUser } from "@italodeandra/auth/api/getFullUser";
import dayjs from "dayjs";
import logo from "../../../public/favicons/android-chrome-512x512.png";

export default function PanelHeader({ title }: { title?: string }) {
  let agentStatus = useAgent(true);
  let { data: user } = useAuthGetFullUser();
  let expirationDate =
    user?.customData?.expirationDate && dayjs(user.customData.expirationDate);

  return (
    <UiHeader className="gap-2">
      <Button
        icon
        variant="text"
        className="-my-2 -ml-2"
        onClick={navigationDrawerState.toggle}
      >
        <Bars3BottomLeftIcon />
      </Button>
      <NextLink href={Routes.Home}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logo.src}
          alt="Logo"
          className={clsx("ml-3 w-9 h-9", {
            grayscale: agentStatus === "unavailable",
          })}
        />
      </NextLink>
      {title && <span className="ml-2 text-xl font-medium">{title}</span>}
      {agentStatus === "unavailable" && (
        <Badge color="error">Agente indisponível</Badge>
      )}
      {agentStatus === "outdated" && (
        <Badge color="error">Agente desatualizado</Badge>
      )}
      {agentStatus !== "available" && (
        <Button
          variant="filled"
          color="primary"
          size="sm"
          href={`/Facebot Setup ${AGENT_VERSION}.exe`}
        >
          Baixar {AGENT_VERSION}
        </Button>
      )}
      <div className="flex-grow" />
      {expirationDate && expirationDate.isBefore(dayjs()) && (
        <Badge color="error">Plano expirado</Badge>
      )}
      <UserMenu />
    </UiHeader>
  );
}
