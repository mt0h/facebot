import { useAuthUser } from "@italodeandra/auth/api/getUser";
import SignInView from "@italodeandra/auth/views/SignInView";
import { GetServerSideProps } from "next";
import { getCookies } from "cookies-next";

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => ({
  props: {
    cookies: getCookies({ req, res }),
  },
});

export default function EntrarPage() {
  let user = useAuthUser();

  if (user) {
    return null;
  }

  return <SignInView disableSignUp />;
}
