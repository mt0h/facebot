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
  args: { _ids: string[] },
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

  const _ids = args._ids.map(isomorphicObjectId);

  await AccountGroup.deleteMany({
    accountId: { $in: _ids },
    userId: user._id,
  });

  await AccountTag.deleteMany({
    accountId: { $in: _ids },
    userId: user._id,
  });

  await Account.deleteMany({
    _id: { $in: _ids },
    userId: user._id,
  });
}

export default apiHandlerWrapper(handler);

export type AccountDeleteManyApiResponse = InferApiResponse<typeof handler>;
export type AccountDeleteManyApiArgs = InferApiArgs<typeof handler>;

const mutationKey = "/api/account/delete-many";

export const useAccountDeleteMany = (
  options?: UseMutationOptions<
    AccountDeleteManyApiResponse,
    unknown,
    AccountDeleteManyApiArgs
  >
) => {
  const queryClient = useQueryClient();
  return useMutation(
    [mutationKey],
    mutationFnWrapper<AccountDeleteManyApiArgs, AccountDeleteManyApiResponse>(
      mutationKey
    ),
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
