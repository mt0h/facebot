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
  args: { _id: string },
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
      status: TaskStatus.PENDING,
      ...(user.type === UserType.ADMIN ? {} : { userId: user._id }),
      queueId: isomorphicObjectId(args._id),
    },
    {
      $set: {
        status: TaskStatus.CANCELLED,
      },
    }
  );
}

export default apiHandlerWrapper(handler);

export type QueueCancelPendingApiResponse = InferApiResponse<typeof handler>;
export type QueueCancelPendingApiUpdateArgs = InferApiArgs<typeof handler>;

const mutationKey = "/api/queue/cancel-pending";

export const useQueueCancelPending = (
  options?: UseMutationOptions<
    QueueCancelPendingApiResponse,
    unknown,
    QueueCancelPendingApiUpdateArgs
  >
) => {
  const queryClient = useQueryClient();
  return useMutation(
    [mutationKey],
    mutationFnWrapper<
      QueueCancelPendingApiUpdateArgs,
      QueueCancelPendingApiResponse
    >(mutationKey),
    {
      ...options,
      async onSuccess(...params) {
        const [, args] = params;
        await invalidate_queueList(queryClient);
        await invalidate_queueGet(queryClient, args);
        await options?.onSuccess?.(...params);
      },
    }
  );
};
