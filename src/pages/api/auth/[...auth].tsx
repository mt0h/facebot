import Routes from "../../../Routes";
import Auth from "@italodeandra/auth/api";
import sendMail from "../../../sendMail";
import connectDb from "../../../db/db";

export default Auth({
  connectDb,
  routes: Routes,
  primaryColor: "#00a59a",
  sendMail,
});
