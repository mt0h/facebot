import "@fontsource-variable/inter";
import "@italodeandra/ui/bootstrap/suppressConsoleLog";
import { QueryClient } from "@tanstack/query-core";
import { Hydrate, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { DefaultSeo } from "next-seo";
import { useState } from "react";
import "../globals.css";
import AppProps from "@italodeandra/ui/bootstrap/AppProps";
import Routes from "../Routes";
import { hydrateNavigationDrawerState } from "@italodeandra/ui/components/NavigationDrawer/navigationDrawer.state";
import setupNProgress from "@italodeandra/ui/bootstrap/nprogress";
import { IAuthContext } from "@italodeandra/auth/AuthContext";
import AuthProvider from "@italodeandra/auth/AuthProvider";
import { hydrateAuthState } from "@italodeandra/auth/auth.state";
import "dayjs/locale/pt-br";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import localizedFormat from "dayjs/plugin/localizedFormat";
import "../db/auth.extend";

dayjs.extend(relativeTime);
dayjs.extend(localizedFormat);
dayjs.locale("pt-br");

const appName = "Facebot";
const appDescription = "";
const appKeywords = "";
const appThemeColor = "#0ea5e9";

const intl: IAuthContext["intl"] = {
  New: "Novo",
  "An user with the same email already exists":
    "Um usuário com o mesmo e-mail já existe",
  "Check your email inbox": "Verifique sua caixa de entrada de e-mail",
  Or: "Ou",
  "create a new account": "crie uma nova conta",
  "Create a new account": "Crie uma nova conta",
  "Click the link we sent you to create a new password":
    "Clique no link que enviamos para criar uma nova senha",
  "Did you remember your password?": "Você lembrou sua senha?",
  "Forgot your password?": "Esqueceu a senha?",
  "if you remembered the password": "se você lembrou sua senha",
  "It was not possible to create the user": "Não foi possível criar o usuário",
  "It was not possible to update the user":
    "Não foi possível atualizar o usuário",
  "New password": "Nova senha",
  "New user": "Novo usuário",
  "No records": "Nenhum resultado",
  Administrator: "Administrador",
  "Please fill with a valid email": "Por favor, preencher com um e-mail válido",
  "Please fill with an email": "Por favor, preencher com um e-mail",
  "Please fill with the new password": "Por favor, preencher com a nova senha",
  Email: "E-mail",
  Name: "Nome",
  "Please fill with your email": "Por favor, preencher com o seu e-mail",
  "Please fill with your password": "Por favor, preencher com a sua senha",
  "Reset password": "Redefinir senha",
  "Reset your password": "Redefinir sua senha",
  "Sign in": "Entrar",
  "Sign in to your account": "Entrar em sua conta",
  "sign in to your account": "entrar em sua conta",
  "Sign up": "Criar conta",
  "There was an unexpected error. Try again later.":
    "Ocorreu um erro inesperado. Tente novamente mais tarde.",
  "There was an unexpected error trying to list the users":
    "Ocorreu um erro inesperado tentando listar os usuários",
  "to your account": "na sua conta",
  "Try again": "Tentar novamente",
  "User not found or incorrect password":
    "Usuário não encontrado ou senha incorreta",
  "We sent a link to": "Nós enviamos um link para",
  "Your token expired. To generate a new one, make a new request to reset your password.":
    "Seu token expirou. Para gerar um novo, faça um novo pedido para redefinir sua senha.",
  Normal: "Normal",
  Password: "Senha",
  Save: "Salvar",
  Saved: "Salvo",
  Type: "Tipo",
  User: "Usuário",
  Users: "Usuários",
  "Created at": "Criado em",
  "Updated at": "Atualizado em",
  Manager: "Gerente",
  "Internal employee": "Colaborador interno",
  "External employee": "Colaborador externo",
  "Password reset successfully": "Senha alterada com sucesso",
  Click: "Clique",
  here: "aqui",
  "to sign in": "para entrar",
};

setupNProgress(appThemeColor);

function MyApp({ Component, pageProps }: AppProps) {
  hydrateNavigationDrawerState(pageProps.cookies);
  hydrateAuthState(pageProps.cookies);

  const [queryClient] = useState(() => new QueryClient());

  const getLayout = Component.getLayout || ((page) => page);

  return (
    <>
      <DefaultSeo
        titleTemplate={`%s - ${appName}`}
        defaultTitle={appName}
        description={appDescription}
        openGraph={{
          images: [
            {
              url: "/favicons/android-chrome-512x512.png",
              height: 512,
              width: 512,
              alt: appName,
            },
          ],
        }}
        additionalLinkTags={[
          {
            rel: "apple-touch-icon",
            sizes: "180x180",
            href: "/favicons/apple-touch-icon.png",
          },
          {
            rel: "icon",
            type: "image/png",
            sizes: "32x32",
            href: "/favicons/favicon-32x32.png",
          },
          {
            rel: "icon",
            type: "image/png",
            sizes: "16x16",
            href: "/favicons/favicon-16x16.png",
          },
          {
            rel: "mask-icon",
            href: "/favicons/safari-pinned-tab.svg",
            color: appThemeColor,
          },
        ]}
        additionalMetaTags={[
          {
            name: "keywords",
            content: appKeywords,
          },
          {
            name: "msapplication-TileColor",
            content: appThemeColor,
          },
          {
            name: "theme-color",
            content: "#ffffff",
          },
          {
            name: "viewport",
            content: "initial-scale=1, width=device-width, maximum-scale=1",
          },
        ]}
      />
      <QueryClientProvider client={queryClient}>
        <Hydrate state={pageProps.dehydratedState}>
          <AuthProvider Routes={Routes} intl={intl}>
            {getLayout(<Component {...pageProps} />)}
            <ReactQueryDevtools position="bottom-right" />
          </AuthProvider>
        </Hydrate>
      </QueryClientProvider>
    </>
  );
}

// noinspection JSUnusedGlobalSymbols
export default MyApp;
