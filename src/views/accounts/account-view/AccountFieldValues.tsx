import Jsonify from "@italodeandra/next/utils/Jsonify";
import { IAccount } from "../../../collections/Account";

export type AccountFieldValues = Jsonify<
  Jsonify<Pick<IAccount, "name" | "notes" | "id">> & {
    cookies: string;
    facebookCookies: string;
    browserCookies: string;
  }
>;
