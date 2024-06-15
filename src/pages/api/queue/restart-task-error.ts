import { getUserFromCookies } from "@italodeandra/auth/collections/user/User.service";
import {
  apiHandlerWrapper,
  InferApiArgs,
  InferApiResponse,
  mutationFnWrapper,
} from "@italodeandra/next/api/apiHandlerWrapper";
import { unauthorized } from "@italodeandra/next/api/errors";
import {
  useMutation,
  UseMutationOptions,
  useQueryClient,
} from "@tanstack/react-query";
import { NextApiRequest, NextApiResponse } from "next";
import connectToDb from "../../../db/db";
import getTask, { TaskStatus } from "../../../collections/Task";
import isomorphicObjectId from "@italodeandra/next/utils/isomorphicObjectId";
import { invalidate_queueList } from "./list";
import { invalidate_queueGet } from "./get";
import { UserType } from "@italodeandra/auth/collections/user/User";

async function handler(
  args: { _id: string[]; queueId: string },
  req: NextApiRequest,
  res: NextApiResponse
) {
  await connectToDb();
  let Task = getTask();
  const user = await getUserFromCookies(req, res);
  if (!user) {
    throw unauthorized(res, { user });
  }

  await Task.updateMany(
    {
      status: {
        $in: [TaskStatus.ERROR, TaskStatus.TIMEOUT],
      },
      ...(user.type === UserType.ADMIN ? {} : { userId: user._id }),
      _id: {
        $in: args._id.map(isomorphicObjectId),
      },
    },
    {
      $set: {
        status: TaskStatus.PENDING,
      },
      $unset: {
        response: "",
      },
    }
  );
}

export default apiHandlerWrapper(handler);

export type QueueRestartTaskErrorApiResponse = InferApiResponse<typeof handler>;
export type QueueRestartTaskErrorApiUpdateArgs = InferApiArgs<typeof handler>;

const mutationKey = "/api/queue/restart-task-error";

export const useQueueRestartError = (
  options?: UseMutationOptions<
    QueueRestartTaskErrorApiResponse,
    unknown,
    QueueRestartTaskErrorApiUpdateArgs
  >
) => {
  const queryClient = useQueryClient();
  return useMutation(
    [mutationKey],
    mutationFnWrapper<
      QueueRestartTaskErrorApiUpdateArgs,
      QueueRestartTaskErrorApiResponse
    >(mutationKey),
    {
      ...options,
      async onSuccess(...params) {
        const [, args] = params;
        await invalidate_queueList(queryClient);
        await invalidate_queueGet(queryClient, { _id: args.queueId });
        await options?.onSuccess?.(...params);
      },
    }
  );
};
