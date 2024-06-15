import { getUserFromCookies } from "@italodeandra/auth/collections/user/User.service";
import {
  apiHandlerWrapper,
  InferApiArgs,
  InferApiResponse,
  queryFnWrapper,
} from "@italodeandra/next/api/apiHandlerWrapper";
import { badRequest, unauthorized } from "@italodeandra/next/api/errors";
import isomorphicObjectId from "@italodeandra/next/utils/isomorphicObjectId";
import Jsonify from "@italodeandra/next/utils/Jsonify";
import { QueryClient, useQuery, UseQueryOptions } from "@tanstack/react-query";
import { ObjectId } from "bson";
import { NextApiRequest, NextApiResponse } from "next";
import connectToDb from "../../../db/db";
import getTask, { ITask } from "../../../collections/Task";
import { UserType } from "@italodeandra/auth/collections/user/User";
import { IAccount } from "../../../collections/Account";

async function handler(
  args: Jsonify<{ _id: ObjectId }>,
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (!args._id) {
    throw badRequest;
  }
  await connectToDb();
  let Task = getTask();
  let user = await getUserFromCookies(req, res);
  if (!user) {
    throw unauthorized(res, { user });
  }

  let _id = isomorphicObjectId(args._id);

  return Task.aggregate<
    Pick<
      ITask,
      | "_id"
      | "bot"
      | "status"
      | "request"
      | "response"
      | "createdAt"
      | "queueId"
      | "updatedAt"
    > & {
      account: Pick<IAccount, "_id" | "name" | "tabs" | "version">;
      group?: string;
    }
  >([
    {
      $match: {
        queueId: _id,
        ...(user.type === UserType.ADMIN ? {} : { userId: user._id }),
      },
    },
    {
      $sort: {
        createdAt: -1,
      },
    },
    {
      $lookup: {
        from: "accounts",
        localField: "request.accountId",
        foreignField: "_id",
        as: "account",
      },
    },
    {
      $lookup: {
        from: "accountGroups",
        localField: "request.groupId",
        foreignField: "id",
        as: "group",
        pipeline: [{ $limit: 1 }],
      },
    },
    {
      $unwind: "$account",
    },
    {
      $unwind: {
        path: "$group",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        bot: 1,
        status: 1,
        request: 1,
        response: 1,
        createdAt: 1,
        queueId: 1,
        updatedAt: 1,
        "account._id": 1,
        "account.name": 1,
        "account.tabs": 1,
        "account.version": 1,
        group: "$group.name",
      },
    },
  ]);
}

export default apiHandlerWrapper(handler);

export type QueueGetApiResponse = InferApiResponse<typeof handler>;
export type QueueGetApiArgs = InferApiArgs<typeof handler>;

const queryKey = "/api/queue/get";

export const useQueueGet = (
  args: QueueGetApiArgs,
  options?: UseQueryOptions<QueueGetApiResponse>
) =>
  useQuery<QueueGetApiResponse>(
    [queryKey, args._id],
    queryFnWrapper<QueueGetApiResponse, QueueGetApiArgs>(queryKey, args),
    {
      ...options,
      enabled: !!args?._id,
    }
  );

export const invalidate_queueGet = async (
  queryClient: QueryClient,
  args: QueueGetApiArgs
) => queryClient.invalidateQueries([queryKey, args._id]);
