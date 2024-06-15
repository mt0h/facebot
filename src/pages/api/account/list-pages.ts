import { getUserFromCookies } from "@italodeandra/auth/collections/user/User.service";
import {
  apiHandlerWrapper,
  InferApiArgs,
  InferApiResponse,
  queryFnWrapper,
} from "@italodeandra/next/api/apiHandlerWrapper";
import { unauthorized } from "@italodeandra/next/api/errors";
import { QueryClient, useQuery } from "@tanstack/react-query";
import { NextApiRequest, NextApiResponse } from "next";
import connectToDb from "../../../db/db";
import { ObjectId } from "bson";
import isomorphicObjectId from "@italodeandra/next/utils/isomorphicObjectId";
import getAccount from "../../../collections/Account";

async function handler(
  args: { accountId: ObjectId | string },
  req: NextApiRequest,
  res: NextApiResponse
) {
  await connectToDb();
  let Account = getAccount();
  const user = await getUserFromCookies(req, res);
  if (!user) {
    throw unauthorized(res, { user });
  }

  return Account.find(
    {
      userId: user._id,
      mainAccountId: isomorphicObjectId(args.accountId),
    },
    {
      projection: {
        name: 1,
      },
      sort: {
        name: 1,
      },
    }
  );
}

export default apiHandlerWrapper(handler);

export type AccountListPagesApiArgs = InferApiArgs<typeof handler>;
export type AccountListPagesApiResponse = InferApiResponse<typeof handler>;

const queryKey = "/api/account/list-pages";

export const useAccountListPages = (args: AccountListPagesApiArgs) =>
  useQuery(
    [queryKey, args.accountId],
    queryFnWrapper<AccountListPagesApiResponse>(queryKey, args)
  );

export const invalidate_accountListPages = async (queryClient: QueryClient) =>
  queryClient.invalidateQueries([queryKey]);
