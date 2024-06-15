import { getCookies } from "cookies-next";
import { GetServerSideProps } from "next";
import connectToDb from "../db/db";
import {
  checkUserType,
  getUserFromCookies,
} from "@italodeandra/auth/collections/user/User.service";
import { UserType } from "@italodeandra/auth/collections/user/User";
import Routes from "../Routes";
import {
  useAuthGetUser,
  useAuthRequiredUserType,
} from "@italodeandra/auth/api/getUser";
import PanelUsersView from "@italodeandra/auth/views/Panel/Users/PanelUsersView";
import getLayout from "../views/layout/panelLayout";

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  await connectToDb();
  const user = await getUserFromCookies(req, res);
  if (!checkUserType(user, [UserType.ADMIN])) {
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
  const { data: user } = useAuthGetUser();

  if (!useAuthRequiredUserType([UserType.ADMIN])) {
    return null;
  }

  return (
    <>
      <div className="h-16" />
      <PanelUsersView
        disableImpersonate={user?._id !== "62da0f38c6dc21efec2136e6"}
      />
    </>
  );
}

Page.getLayout = getLayout;
