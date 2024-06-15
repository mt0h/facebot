import { getCookies } from "cookies-next";
import { GetServerSideProps } from "next";
import { getUserFromCookies } from "@italodeandra/auth/collections/user/User.service";
import { useAuthRequiredUser } from "@italodeandra/auth/api/getUser";
import connectToDb from "../../db/db";
import Routes from "../../Routes";
import getLayout from "../../views/layout/panelLayout";
import AccountView from "../../views/accounts/account-view/AccountView";
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

export default function Page() {
  if (!useAuthRequiredUser()) {
    return null;
  }

  return (
    <>
      <div className="h-16" />
      <Expiration />
      <AccountView />
    </>
  );
}

Page.getLayout = getLayout;
