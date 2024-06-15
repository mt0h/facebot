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
import isomorphicObjectId from "@italodeandra/next/utils/isomorphicObjectId";
import getAccount from "../../../collections/Account";
import { invalidate_accountList } from "./list";

async function handler(
  args: {
    accountId: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    pages: { id: string; name: string; facebookCookies: any }[];
  },
  req: NextApiRequest,
  res: NextApiResponse
) {
  await connectToDb();
  let Account = getAccount();
  const user = await getUserFromCookies(req, res);
  if (!user) {
    throw unauthorized(res, { user });
  }

  let accountId = isomorphicObjectId(args.accountId);

  let account = await Account.findById(accountId);
  if (!account) {
    throw notFound;
  }

  await Account.deleteMany({
    userId: user._id,
    mainAccountId: accountId,
    id: {
      $nin: args.pages.map((g) => g.id),
    },
  });

  for (let page of args.pages) {
    await Account.findOneAndUpdate(
      {
        userId: user._id,
        mainAccountId: accountId,
        id: page.id,
      },
      {
        $set: {
          facebookCookies: page.facebookCookies,
        },
        $setOnInsert: {
          userId: user._id,
          mainAccountId: accountId,
          id: page.id,
          name: page.name,
          version: 2,
        },
      },
      {
        upsert: true,
      }
    );
  }
}

export default apiHandlerWrapper(handler);

export type AccountSavePagesRefreshApiResponse = InferApiResponse<
  typeof handler
>;
export type AccountSavePagesRefreshApiArgs = InferApiArgs<typeof handler>;

const mutationKey = "/api/account/save-pages-refresh";

export const useAccountSavePagesRefresh = (
  options?: UseMutationOptions<
    AccountSavePagesRefreshApiResponse,
    unknown,
    AccountSavePagesRefreshApiArgs
  >
) => {
  const queryClient = useQueryClient();
  return useMutation(
    [mutationKey],
    mutationFnWrapper<
      AccountSavePagesRefreshApiArgs,
      AccountSavePagesRefreshApiResponse
    >(mutationKey),
    {
      ...options,
      async onSuccess(...params) {
        await invalidate_accountList(queryClient);
        await options?.onSuccess?.(...params);
      },
    }
  );
};
