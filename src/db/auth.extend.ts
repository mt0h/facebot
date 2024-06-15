// noinspection JSUnusedGlobalSymbols

import { UserType } from "@italodeandra/auth/collections/user/User";
import { userTypeTranslations } from "@italodeandra/auth/collections/user/User.service";
import { ISettings } from "../collections/settings/Settings";

declare module "@italodeandra/auth/collections/user/User" {
  interface IUserType {
    PREMIUM: "PREMIUM";
  }

  interface UserCustomData {
    settings: ISettings;
    accountLimit: number;
    expirationDate: Date;
  }
}

UserType.PREMIUM = "PREMIUM";

userTypeTranslations.PREMIUM = "Premium";
