import db from "@italodeandra/next/db";
import { onlyServer } from "@italodeandra/next/utils/isServer";
import { schema, types, VALIDATION_ACTIONS, VALIDATION_LEVEL } from "papr";
import { TaskBot } from "./Task";

const queueSchema = onlyServer(() =>
  schema(
    {
      userId: types.objectId({ required: true }),
      bot: types.enum(Object.values(TaskBot), { required: true }),
      date: types.date({ required: true }),
      url: types.string(),
      request: types.object({
        tags: types.array(types.string()),
        comments: types.string(),
        description: types.string(),
        like: types.boolean(),
      }),
    },
    {
      timestamps: true,
      validationLevel: VALIDATION_LEVEL.OFF,
      validationAction: VALIDATION_ACTIONS.WARN,
    }
  )
);

const getQueue = () => onlyServer(() => db.model("queues", queueSchema));

export type IQueue = (typeof queueSchema)[0];

export default getQueue;
