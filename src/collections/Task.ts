import db from "@italodeandra/next/db";
import { onlyServer } from "@italodeandra/next/utils/isServer";
import { schema, types, VALIDATION_ACTIONS, VALIDATION_LEVEL } from "papr";
import { ObjectId } from "bson";

export enum TaskStatus {
  PENDING = "PENDING",
  IN_PROGRESS = "IN_PROGRESS",
  DONE = "DONE",
  ERROR = "ERROR",
  TIMEOUT = "TIMEOUT",
  CANCELLED = "CANCELLED",
}

export enum TaskBot {
  POST_COMMENT = "POST_COMMENT",
  SHARE_ON_GROUP = "SHARE_ON_GROUP",
  SHARE_ON_GROUP_GQL = "SHARE_ON_GROUP_GQL",
  POST_COMMENT_GQL = "POST_COMMENT_GQL",
}

export type ITask = {
  _id: ObjectId;
  status: TaskStatus;
  userId: ObjectId;
  queueId: ObjectId;
  bot: TaskBot;
  request: {
    postUrl?: string;
    comment?: string;
    description?: string;
    like?: boolean;
    accountId: ObjectId;
    groupId?: string;
  };
  response?: {
    duration?: number;
    error?: {
      message: string;
      stack?: string;
      screenshot?: string;
      caught?: boolean;
    };
    postId?: string;
  };
  date: Date;
  createdAt: Date;
  updatedAt: Date;
};

const taskSchema = onlyServer(() =>
  schema<
    Omit<ITask, "_id" | "createdAt" | "updatedAt">,
    {
      timestamps: true;
      validationLevel: VALIDATION_LEVEL;
      validationAction: VALIDATION_ACTIONS;
    }
  >(
    {
      status: types.enum(Object.values(TaskStatus), { required: true }),
      userId: types.objectId({ required: true }),
      queueId: types.objectId({ required: true }),
      bot: types.enum(Object.values(TaskBot), { required: true }),
      request: types.any({ required: true }),
      response: types.any(),
      date: types.date({
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

const getTask = () => onlyServer(() => db.model("tasks", taskSchema));

export default getTask;
