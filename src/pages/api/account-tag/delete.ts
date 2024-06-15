import { NextApiRequest, NextApiResponse } from "next";
import {
  useMutation,
  UseMutationOptions,
  useQueryClient,
} from "@tanstack/react-query";
import { getUserFromCookies } from "@italodeandra/auth/collections/user/User.service";
import { unauthorized } from "@italodeandra/next/api/errors";
import isomorphicObjectId from "@italodeandra/next/utils/isomorphicObjectId";
import {
  apiHandlerWrapper,
  InferApiArgs,
  InferApiResponse,
  mutationFnWrapper,
} from "@italodeandra/next/api/apiHandlerWrapper";
import { invalidate_accountTagList } from "./list";
import connectToDb from "../../../db/db";
import getAccountTag from "../../../collections/AccountTag";

async function handler(
  args: { _id: string },
  req: NextApiRequest,
  res: NextApiResponse
) {
  await connectToDb();
  let AccountTag = getAccountTag();
  const user = await getUserFromCookies(req, res);
  if (!user) {
    throw unauthorized(res, { user });
  }

  const _id = isomorphicObjectId(args._id);

  await AccountTag.deleteOne({
    _id,
    userId: user._id,
  });
}

export default apiHandlerWrapper(handler);

export type AccountTagDeleteResponse = InferApiResponse<typeof handler>;
export type AccountTagDeleteArgs = InferApiArgs<typeof handler>;

const mutationKey = "/api/account-tag/delete";

export const useAccountTagDelete = (
  options?: UseMutationOptions<
    AccountTagDeleteResponse,
    unknown,
    AccountTagDeleteArgs
  >
) => {
  const queryClient = useQueryClient();
  return useMutation(
    [mutationKey],
    mutationFnWrapper<AccountTagDeleteArgs, AccountTagDeleteResponse>(
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
