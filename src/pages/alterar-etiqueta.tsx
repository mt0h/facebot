import { getCookies } from "cookies-next";
import { GetServerSideProps } from "next";
import { getUserFromCookies } from "@italodeandra/auth/collections/user/User.service";
import { useAuthRequiredUser } from "@italodeandra/auth/api/getUser";
import connectToDb from "../db/db";
import Routes from "../Routes";
import getLayout from "../views/layout/panelLayout";
import { UpdateTagView } from "../views/accounts/update-tag/UpdateTagView";
import { Expiration } from "../views/layout/Expiration";

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
      <UpdateTagView />
    </>
  );
}

Page.getLayout = getLayout;
