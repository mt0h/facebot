import db from "@italodeandra/next/db";
import { onlyServer } from "@italodeandra/next/utils/isServer";
import { schema, types, VALIDATION_ACTIONS, VALIDATION_LEVEL } from "papr";

const accountTagSchema = onlyServer(() =>
  schema(
    {
      accountId: types.objectId({ required: true }),
      label: types.string({ required: true }),
      userId: types.objectId({ required: true }),
      groupsIds: types.array(types.objectId({ required: true }), {
        required: true,
      }),
    },
    {
      timestamps: true,
      validationLevel: VALIDATION_LEVEL.OFF,
      validationAction: VALIDATION_ACTIONS.WARN,
    }
  )
);

const getAccountTag = () =>
  onlyServer(() => db.model("accountTags", accountTagSchema));

export type IAccountTag = (typeof accountTagSchema)[0];

export default getAccountTag;
