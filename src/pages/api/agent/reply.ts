import { getFullUserFromCookies } from "@italodeandra/auth/collections/user/User.service";
import { apiHandlerWrapper } from "@italodeandra/next/api/apiHandlerWrapper";
import { conflict, unauthorized } from "@italodeandra/next/api/errors";
import { NextApiRequest, NextApiResponse } from "next";
import connectToDb from "../../../db/db";
import getAccount from "../../../collections/Account";
import getTask, { TaskStatus } from "../../../collections/Task";
import isomorphicObjectId from "@italodeandra/next/utils/isomorphicObjectId";
import { defaultSettings } from "../../../collections/settings/defaultSettings";
import { map, omit } from "lodash";
import getAccountTag from "../../../collections/AccountTag";
import dayjs from "dayjs";

async function handler(
  args: {
    request:
      | "updateTasksWithTimeout"
      | "getPendingTask"
      | "getAccount"
      | "updateAccount"
      | "setTaskError"
      | "setAccountError"
      | "finishTask"
      | "insertAccount"
      | "getSettings"
      | "cancelOldTasks";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    args?: any;
  },
  req: NextApiRequest,
  res: NextApiResponse
) {
  await connectToDb();
  let Task = getTask();
  let Account = getAccount();
  let AccountTag = getAccountTag();
  const user = await getFullUserFromCookies(req, res);
  if (!user) {
    throw unauthorized(res, { user });
  }

  // noinspection JSUnresolvedReference
  let task = args.args?.task;
  let startTime = args.args?.startTime;
  let error = args.args?.error;
  let accountId = args.args?.accountId;
  let $set = args.args?.$set;
  let doc = args.args?.doc;
  let postId = args.args?.postId;

  if (args.request === "getPendingTask") {
    await Task.deleteMany({
      date: {
        $lte: dayjs().subtract(15, "days").toDate(),
      },
    });

    let busyProfiles = map(
      await Task.find({
        userId: user._id,
        status: TaskStatus.IN_PROGRESS,
      }),
      "request.accountId"
    );
    return await Task.findOneAndUpdate(
      {
        userId: user._id,
        status: TaskStatus.PENDING,
        date: {
          $lte: new Date(),
        },
        "request.accountId": {
          $nin: busyProfiles,
        },
      },
      {
        $set: {
          status: TaskStatus.IN_PROGRESS,
        },
      }
    );
  } else if (args.request === "getAccount") {
    return Account.findOne({
      _id: isomorphicObjectId(accountId),
      userId: user._id,
    });
  } else if (args.request === "updateAccount") {
    return Account.updateOne(
      {
        _id: isomorphicObjectId(accountId),
        userId: user._id,
      },
      {
        $set,
      }
    );
  } else if (args.request === "insertAccount") {
    let accountLimit = user.customData?.accountLimit || 0;
    let accountCount = await Account.countDocuments({
      userId: user._id,
    });

    if (accountCount > accountLimit) {
      throw unauthorized;
    }
    if (
      await Account.countDocuments({
        userId: user._id,
        id: doc.id,
      })
    ) {
      throw conflict;
    }
    let account = await Account.insertOne({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...(omit(doc, "tags") as any),
      userId: user._id,
    });

    if (doc.tags?.length) {
      await AccountTag.insertMany(
        doc.tags.map((tag: string) => ({
          accountId: account._id,
          label: tag,
          userId: user._id,
          groupsIds: [],
        }))
      );
    }

    return account;
  } else if (args.request === "setTaskError") {
    await Task.updateOne(
      {
        userId: user._id,
        _id: isomorphicObjectId(task._id),
      },
      {
        $set: {
          status: TaskStatus.ERROR,
          response: {
            error,
          },
        },
      }
    );
  } else if (args.request === "setAccountError") {
    await Account.updateOne(
      {
        _id: isomorphicObjectId(accountId),
        userId: user._id,
      },
      {
        $set: {
          error,
        },
      }
    );
    await Task.updateMany(
      {
        userId: user._id,
        "request.accountId": isomorphicObjectId(accountId),
        status: TaskStatus.PENDING,
      },
      {
        $set: {
          status: TaskStatus.ERROR,
          response: {
            duration: Date.now() - startTime,
            error: {
              message: error,
            },
          },
        },
      }
    );
  } else if (args.request === "finishTask") {
    await Task.updateOne(
      {
        userId: user._id,
        _id: isomorphicObjectId(task._id),
      },
      {
        $set: {
          status: TaskStatus.DONE,
          response: {
            duration: Date.now() - startTime,
            postId,
          },
        },
      }
    );
  } else if (args.request === "getSettings") {
    return user.customData?.settings || defaultSettings;
  }
}

export default apiHandlerWrapper(handler);
