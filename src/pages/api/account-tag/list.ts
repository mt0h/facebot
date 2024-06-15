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
import getAccountTag from "../../../collections/AccountTag";
import isomorphicObjectId from "@italodeandra/next/utils/isomorphicObjectId";
import { invalidate_accountTagGetUserTags } from "./get-user-tags";

async function handler(
  args: { accountId: ObjectId | string },
  req: NextApiRequest,
  res: NextApiResponse
) {
  await connectToDb();
  let AccountTag = getAccountTag();
  const user = await getUserFromCookies(req, res);
  if (!user) {
    throw unauthorized(res, { user });
  }

  return AccountTag.find(
    {
      userId: user._id,
      accountId: isomorphicObjectId(args.accountId),
    },
    {
      projection: {
        label: 1,
        groupsIds: 1,
      },
      sort: {
        label: 1,
      },
    }
  );
}

export default apiHandlerWrapper(handler);

export type AccountTagListApiArgs = InferApiArgs<typeof handler>;
export type AccountTagListApiResponse = InferApiResponse<typeof handler>;

const queryKey = "/api/account-tag/list";

export const useAccountTagList = (args: AccountTagListApiArgs) =>
  useQuery(
    [queryKey, args.accountId],
    queryFnWrapper<AccountTagListApiResponse>(queryKey, args)
  );

export const invalidate_accountTagList = async (queryClient: QueryClient) => {
  await invalidate_accountTagGetUserTags(queryClient);
  return queryClient.invalidateQueries([queryKey]);
};
