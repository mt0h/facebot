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
import { invalidate_accountList } from "./list";
import connectToDb from "../../../db/db";
import getAccount from "../../../collections/Account";
import getAccountGroup from "../../../collections/AccountGroup";
import getAccountTag from "../../../collections/AccountTag";
import { invalidate_accountGroupList } from "../account-group/list";
import { invalidate_accountTagList } from "../account-tag/list";

async function handler(
  args: { _id: string },
  req: NextApiRequest,
  res: NextApiResponse
) {
  await connectToDb();
  let Account = getAccount();
  let AccountGroup = getAccountGroup();
  let AccountTag = getAccountTag();
  const user = await getUserFromCookies(req, res);
  if (!user) {
    throw unauthorized(res, { user });
  }

  const _id = isomorphicObjectId(args._id);

  await AccountGroup.deleteMany({
    accountId: _id,
    userId: user._id,
  });

  await AccountTag.deleteMany({
    accountId: _id,
    userId: user._id,
  });

  await Account.deleteOne({
    _id,
    userId: user._id,
  });
}

export default apiHandlerWrapper(handler);

export type AccountDeleteResponse = InferApiResponse<typeof handler>;
export type AccountDeleteArgs = InferApiArgs<typeof handler>;

const mutationKey = "/api/account/delete";

export const useAccountDelete = (
  options?: UseMutationOptions<
    AccountDeleteResponse,
    unknown,
    AccountDeleteArgs
  >
) => {
  const queryClient = useQueryClient();
  return useMutation(
    [mutationKey],
    mutationFnWrapper<AccountDeleteArgs, AccountDeleteResponse>(mutationKey),
    {
      ...options,
      async onSuccess(...params) {
        await invalidate_accountList(queryClient);
        await invalidate_accountGroupList(queryClient);
        await invalidate_accountTagList(queryClient);
        await options?.onSuccess?.(...params);
      },
    }
  );
};
