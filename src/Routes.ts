export default class Routes {
  static Home = "/";
  static Panel = "/";

  static SignUp = "/criar-conta";
  static ForgotPassword = "/esqueci-minha-senha";
  static SignIn = "/entrar";

  static ResetPassword(token: string) {
    return `/redefinir-senha/${token}`;
  }

  static PanelUsers = "/usuarios";
  static PanelNewUser = "/usuario/novo";
  static PanelUser(id: string) {
    return `/usuario/${id}`;
  }

  static PanelAccounts = "/contas";
  static PanelNewAccount = "/conta/nova";
  static PanelAccount(id: string) {
    return `/conta/${id}`;
  }
  static UpdateTag = "/alterar-etiqueta";

  static PanelBotPostComments = "/robo/postar-comentarios";
  static PanelBotShareOnGroup = "/robo/compartilhar-em-grupo";
  static PanelBotPostCommentsGql = "/robo/postar-comentarios-graphql";
  static PanelBotShareOnGroupGql = "/robo/compartilhar-em-grupo-graphql";

  static PanelQueue = "/fila";
  static PanelSettings = "/configuracoes";
  static PanelQueueTasks(id: string) {
    return `/fila/${id}`;
  }

  static PanelImportAccounts = "/importar";
}
