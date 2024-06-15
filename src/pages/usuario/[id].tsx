import { getCookies } from "cookies-next";
import { GetServerSideProps } from "next";
import connectToDb from "../../db/db";
import {
  checkUserType,
  getUserFromCookies,
} from "@italodeandra/auth/collections/user/User.service";
import { UserType } from "@italodeandra/auth/collections/user/User";
import Routes from "../../Routes";
import { useAuthRequiredUserType } from "@italodeandra/auth/api/getUser";
import PanelUserView from "@italodeandra/auth/views/Panel/Users/PanelUserView";
import getLayout from "../../views/layout/panelLayout";
import { UserCustomFields } from "../../views/users/UserCustomFields";

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

export default function PanelUserPage() {
  if (!useAuthRequiredUserType([UserType.ADMIN])) {
    return null;
  }

  return (
    <>
      <div className="h-16" />
      <PanelUserView
        customFields={(form, isLoadingFields) => (
          <UserCustomFields form={form} isLoadingFields={isLoadingFields} />
        )}
      />
    </>
  );
}

PanelUserPage.getLayout = getLayout;
