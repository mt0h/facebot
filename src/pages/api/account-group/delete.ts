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
import connectToDb from "../../../db/db";
import getAccountGroup from "../../../collections/AccountGroup";
import { invalidate_accountGroupList } from "./list";

async function handler(
  args: { _id: string },
  req: NextApiRequest,
  res: NextApiResponse
) {
  await connectToDb();
  let AccountGroup = getAccountGroup();
  const user = await getUserFromCookies(req, res);
  if (!user) {
    throw unauthorized(res, { user });
  }

  const _id = isomorphicObjectId(args._id);

  await AccountGroup.deleteOne({
    _id,
    userId: user._id,
  });
}

export default apiHandlerWrapper(handler);

export type AccountGroupDeleteResponse = InferApiResponse<typeof handler>;
export type AccountGroupDeleteArgs = InferApiArgs<typeof handler>;

const mutationKey = "/api/account-group/delete";

export const useAccountGroupDelete = (
  options?: UseMutationOptions<
    AccountGroupDeleteResponse,
    unknown,
    AccountGroupDeleteArgs
  >
) => {
  const queryClient = useQueryClient();
  return useMutation(
    [mutationKey],
    mutationFnWrapper<AccountGroupDeleteArgs, AccountGroupDeleteResponse>(
      mutationKey
    ),
    {
      ...options,
      async onSuccess(...params) {
        await invalidate_accountGroupList(queryClient);
        await options?.onSuccess?.(...params);
      },
    }
  );
};
