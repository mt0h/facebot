import { GetServerSideProps } from "next";
import { getCookies } from "cookies-next";
import getLayout from "../views/layout/panelLayout";
import { HomeView } from "../views/HomeView";
import connectToDb from "../db/db";
import { getUserFromCookies } from "@italodeandra/auth/collections/user/User.service";
import Routes from "../Routes";
import { useAuthRequiredUser } from "@italodeandra/auth/api/getUser";
import { Expiration } from "../views/layout/Expiration";

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  await connectToDb();
  const user = await getUserFromCookies(req, res);
  if (!user) {
    return {
      redirect: {
        destination: Routes.SignIn,
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

export default function Page() {
  if (!useAuthRequiredUser()) {
    return null;
  }
  return (
    <>
      <div className="h-16" />
      <Expiration />
      <HomeView />
    </>
  );
}

Page.getLayout = getLayout;
