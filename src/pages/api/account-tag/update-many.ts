import { getUserFromCookies } from "@italodeandra/auth/collections/user/User.service";
import {
  apiHandlerWrapper,
  InferApiArgs,
  InferApiResponse,
  mutationFnWrapper,
} from "@italodeandra/next/api/apiHandlerWrapper";
import { unauthorized } from "@italodeandra/next/api/errors";
import isomorphicObjectId from "@italodeandra/next/utils/isomorphicObjectId";
import {
  useMutation,
  UseMutationOptions,
  useQueryClient,
} from "@tanstack/react-query";
import { NextApiRequest, NextApiResponse } from "next";
import connectToDb from "../../../db/db";
import { invalidate_accountTagList } from "./list";
import getAccountTag from "../../../collections/AccountTag";

async function handler(
  args: { tags: string[]; accountIds: string[] },
  req: NextApiRequest,
  res: NextApiResponse
) {
  await connectToDb();
  let AccountTag = getAccountTag();
  const user = await getUserFromCookies(req, res);
  if (!user) {
    throw unauthorized(res, { user });
  }

  for (let accountId of args.accountIds) {
    for (let tag of args.tags) {
      await AccountTag.findOneAndUpdate(
        {
          accountId: isomorphicObjectId(accountId),
          userId: user._id,
        },
        {
          $set: {
            label: tag,
          },
          $setOnInsert: {
            accountId: isomorphicObjectId(accountId),
            groupsIds: [],
            userId: user._id,
          },
        },
        {
          upsert: true,
        }
      );
    }
  }
}

export default apiHandlerWrapper(handler);

export type AccountTagUpdateManyResponse = InferApiResponse<typeof handler>;
export type AccountTagUpdateManyArgs = InferApiArgs<typeof handler>;

const mutationKey = "/api/account-tag/update-many";

export const useAccountTagUpdateMany = (
  options?: UseMutationOptions<
    AccountTagUpdateManyResponse,
    unknown,
    AccountTagUpdateManyArgs
  >
) => {
  const queryClient = useQueryClient();
  return useMutation(
    [mutationKey],
    mutationFnWrapper<AccountTagUpdateManyArgs, AccountTagUpdateManyResponse>(
      mutationKey
    ),
    {
      ...options,
      async onSuccess(...params) {
        await invalidate_accountTagList(queryClient);
        await options?.onSuccess?.(...params);
      },
    }
  );
};
