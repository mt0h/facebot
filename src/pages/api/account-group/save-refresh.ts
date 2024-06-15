import { getUserFromCookies } from "@italodeandra/auth/collections/user/User.service";
import {
  apiHandlerWrapper,
  InferApiArgs,
  InferApiResponse,
  mutationFnWrapper,
} from "@italodeandra/next/api/apiHandlerWrapper";
import { notFound, unauthorized } from "@italodeandra/next/api/errors";
import {
  useMutation,
  UseMutationOptions,
  useQueryClient,
} from "@tanstack/react-query";
import { NextApiRequest, NextApiResponse } from "next";
import connectToDb from "../../../db/db";
import getAccountGroup from "../../../collections/AccountGroup";
import isomorphicObjectId from "@italodeandra/next/utils/isomorphicObjectId";
import getAccount from "../../../collections/Account";
import { invalidate_accountGroupList } from "./list";

async function handler(
  args: {
    accountId: string;
    groups: { id: string; name: string; gqlId?: string }[];
  },
  req: NextApiRequest,
  res: NextApiResponse
) {
  await connectToDb();
  let Account = getAccount();
  let AccountGroup = getAccountGroup();
  const user = await getUserFromCookies(req, res);
  if (!user) {
    throw unauthorized(res, { user });
  }

  let accountId = isomorphicObjectId(args.accountId);

  let account = await Account.findById(accountId);
  if (!account) {
    throw notFound;
  }

  await AccountGroup.deleteMany({
    userId: user._id,
    accountId,
    id: {
      $nin: args.groups.map((g) => g.id),
    },
  });

  for (let group of args.groups) {
    await AccountGroup.findOneAndUpdate(
      {
        userId: user._id,
        accountId,
        id: group.id,
      },
      {
        $set: {
          name: group.name,
          gqlId: group.gqlId,
        },
        $setOnInsert: {
          userId: user._id,
          accountId,
          id: group.id,
          name: group.name,
        },
      },
      {
        upsert: true,
      }
    );
  }
}

export default apiHandlerWrapper(handler);

export type AccountGroupSaveRefreshApiResponse = InferApiResponse<
  typeof handler
>;
export type AccountGroupSaveRefreshApiArgs = InferApiArgs<typeof handler>;

const mutationKey = "/api/account-group/save-refresh";

export const useAccountGroupSaveRefresh = (
  options?: UseMutationOptions<
    AccountGroupSaveRefreshApiResponse,
    unknown,
    AccountGroupSaveRefreshApiArgs
  >
) => {
  const queryClient = useQueryClient();
  return useMutation(
    [mutationKey],
    mutationFnWrapper<
      AccountGroupSaveRefreshApiArgs,
      AccountGroupSaveRefreshApiResponse
    >(mutationKey),
    {
      ...options,
      async onSuccess(...params) {
        await invalidate_accountGroupList(queryClient);
        await options?.onSuccess?.(...params);
      },
    }
  );
};
