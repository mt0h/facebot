import { getUserFromCookies } from "@italodeandra/auth/collections/user/User.service";
import {
  apiHandlerWrapper,
  InferApiArgs,
  InferApiResponse,
  queryFnWrapper,
} from "@italodeandra/next/api/apiHandlerWrapper";
import {
  badRequest,
  notFound,
  unauthorized,
} from "@italodeandra/next/api/errors";
import isomorphicObjectId from "@italodeandra/next/utils/isomorphicObjectId";
import Jsonify from "@italodeandra/next/utils/Jsonify";
import { QueryClient, useQuery, UseQueryOptions } from "@tanstack/react-query";
import { ObjectId } from "bson";
import { NextApiRequest, NextApiResponse } from "next";
import connectToDb from "../../../db/db";
import getAccount from "../../../collections/Account";

async function handler(
  args: Jsonify<{ _id: ObjectId }>,
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (!args._id) {
    throw badRequest;
  }
  await connectToDb();
  let Account = getAccount();
  let user = await getUserFromCookies(req, res);
  if (!user) {
    throw unauthorized(res, { user });
  }

  let doc = await Account.findOne(
    {
      _id: isomorphicObjectId(args._id),
      userId: user._id,
    },
    {
      projection: {
        id: 1,
        name: 1,
        notes: 1,
        mainAccountId: 1,
        facebookCookies: 1,
        browserCookies: 1,
        version: 1,
        error: 1,
      },
    }
  );

  if (!doc) {
    throw notFound;
  }

  return doc;
}

export default apiHandlerWrapper(handler);

export type AccountGetApiResponse = InferApiResponse<typeof handler>;
export type AccountGetApiArgs = InferApiArgs<typeof handler>;

const queryKey = "/api/account/get";

export const useAccountGet = (
  args?: AccountGetApiArgs,
  options?: UseQueryOptions<AccountGetApiResponse>
) =>
  useQuery<AccountGetApiResponse>(
    [queryKey, args?._id],
    queryFnWrapper<AccountGetApiResponse, AccountGetApiArgs>(queryKey, args),
    {
      ...options,
      enabled: !!args?._id,
    }
  );

export const invalidate_accountGet = (
  queryClient: QueryClient,
  args: Parameters<typeof handler>[0]
) => queryClient.invalidateQueries([queryKey, args._id]);
