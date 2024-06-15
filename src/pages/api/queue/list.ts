import { getUserFromCookies } from "@italodeandra/auth/collections/user/User.service";
import {
  apiHandlerWrapper,
  InferApiResponse,
  queryFnWrapper,
} from "@italodeandra/next/api/apiHandlerWrapper";
import { unauthorized } from "@italodeandra/next/api/errors";
import { QueryClient, useQuery, UseQueryOptions } from "@tanstack/react-query";
import { NextApiRequest, NextApiResponse } from "next";
import connectToDb from "../../../db/db";
import { TaskStatus } from "../../../collections/Task";
import getQueue, { IQueue } from "../../../collections/Queue";

async function handler(_args: void, req: NextApiRequest, res: NextApiResponse) {
  await connectToDb();
  const Queue = getQueue();
  const user = await getUserFromCookies(req, res);
  if (!user) {
    throw unauthorized(res, { user });
  }

  return Queue.aggregate<
    Pick<IQueue, "_id" | "createdAt" | "bot" | "date" | "url" | "request"> & {
      tasks: Record<TaskStatus, number>;
      meanDuration: number;
    }
  >([
    {
      $match: {
        userId: user._id,
      },
    },
    {
      $sort: {
        createdAt: -1,
      },
    },
    {
      $limit: 30,
    },
    {
      $lookup: {
        from: "tasks",
        let: { queueId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$queueId", "$$queueId"],
              },
            },
          },
          {
            $group: {
              _id: "$status",
              count: { $sum: 1 },
            },
          },
        ],
        as: "tasks",
      },
    },
    {
      $lookup: {
        from: "tasks",
        let: { queueId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$queueId", "$$queueId"] },
                  { $eq: ["$status", TaskStatus.DONE] },
                ],
              },
            },
          },
          {
            $group: {
              _id: null,
              meanDuration: { $avg: "$response.duration" },
            },
          },
        ],
        as: "doneTasks",
      },
    },
    {
      $addFields: {
        tasks: {
          $arrayToObject: {
            $map: {
              input: "$tasks",
              as: "task",
              in: {
                k: "$$task._id",
                v: "$$task.count",
              },
            },
          },
        },
        meanDuration: { $arrayElemAt: ["$doneTasks.meanDuration", 0] },
      },
    },
    {
      $project: {
        createdAt: 1,
        bot: 1,
        date: 1,
        url: 1,
        request: 1,
        tasks: 1,
        meanDuration: 1,
      },
    },
  ]);
}

export default apiHandlerWrapper(handler);

export type QueueListApiResponse = InferApiResponse<typeof handler>;

const queryKey = "/api/queue/list";

export const useQueueList = (options?: UseQueryOptions<QueueListApiResponse>) =>
  useQuery<QueueListApiResponse>([queryKey], queryFnWrapper(queryKey), options);

export const invalidate_queueList = async (queryClient: QueryClient) =>
  queryClient.invalidateQueries([queryKey]);
