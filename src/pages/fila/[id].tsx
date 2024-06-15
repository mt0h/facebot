import { getCookies } from "cookies-next";
import { GetServerSideProps } from "next";
import connectToDb from "../../db/db";
import { getUserFromCookies } from "@italodeandra/auth/collections/user/User.service";
import Routes from "../../Routes";
import { useAuthRequiredUser } from "@italodeandra/auth/api/getUser";
import getLayout from "../../views/layout/panelLayout";
import QueueTasksView from "../../views/queue/QueueTasksView";
import { Expiration } from "../../views/layout/Expiration";

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  await connectToDb();
  const user = await getUserFromCookies(req, res);
  if (!user) {
    return {
      redirect: {
        destination: Routes.Home,
        permanent: false,
      },
    };
  }

  return {
    props: {
      cookies: getCookies({ req, res }),
    },
  };
};

export default function PanelUserPage() {
  if (!useAuthRequiredUser()) {
    return null;
  }

  return (
    <>
      <div className="h-16" />
      <Expiration />
      <QueueTasksView />
    </>
  );
}

PanelUserPage.getLayout = getLayout;
