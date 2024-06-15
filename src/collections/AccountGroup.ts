import db from "@italodeandra/next/db";
import { onlyServer } from "@italodeandra/next/utils/isServer";
import { schema, types, VALIDATION_ACTIONS, VALIDATION_LEVEL } from "papr";

const accountGroupSchema = onlyServer(() =>
  schema(
    {
      accountId: types.objectId({ required: true }),
      userId: types.objectId({ required: true }),
      id: types.string({ required: true }),
      gqlId: types.string(),
      name: types.string({ required: true }),
    },
    {
      timestamps: true,
      validationLevel: VALIDATION_LEVEL.OFF,
      validationAction: VALIDATION_ACTIONS.WARN,
    }
  )
);

const getAccountGroup = () =>
  onlyServer(() => db.model("accountGroups", accountGroupSchema));

export type IAccountGroup = (typeof accountGroupSchema)[0];

export default getAccountGroup;
