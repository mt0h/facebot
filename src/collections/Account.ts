import db from "@italodeandra/next/db";
import { onlyServer } from "@italodeandra/next/utils/isServer";
import { schema, types, VALIDATION_ACTIONS, VALIDATION_LEVEL } from "papr";

const accountSchema = onlyServer(() =>
  schema(
    {
      id: types.string(),
      name: types.string({ required: true }),
      cookies: types.any(),
      tabs: types.array(types.string()),
      userId: types.objectId({ required: true }),
      notes: types.string(),
      mainAccountId: types.objectId(),
      version: types.number(),
      browserCookies: types.any(),
      facebookCookies: types.any(),
      error: types.string(),
    },
    {
      timestamps: true,
      validationLevel: VALIDATION_LEVEL.OFF,
      validationAction: VALIDATION_ACTIONS.WARN,
    }
  )
);

const getAccount = () => onlyServer(() => db.model("accounts", accountSchema));

export type IAccount = (typeof accountSchema)[0];

export default getAccount;
