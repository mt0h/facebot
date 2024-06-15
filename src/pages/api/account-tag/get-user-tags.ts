import { getUserFromCookies } from "@italodeandra/auth/collections/user/User.service";
import {
  apiHandlerWrapper,
  InferApiResponse,
  queryFnWrapper,
} from "@italodeandra/next/api/apiHandlerWrapper";
import { unauthorized } from "@italodeandra/next/api/errors";
import { QueryClient, useQuery } from "@tanstack/react-query";
import { NextApiRequest, NextApiResponse } from "next";
import connectToDb from "../../../db/db";
import getAccountTag from "../../../collections/AccountTag";

async function handler(_args: void, req: NextApiRequest, res: NextApiResponse) {
  await connectToDb();
  let AccountTag = getAccountTag();
  const user = await getUserFromCookies(req, res);
  if (!user) {
    throw unauthorized(res, { user });
  }

  return (
    (
      await AccountTag.aggregate<{ tags: string[] }>([
        {
          $match: {
            userId: user._id,
          },
        },
        {
          $group: {
            _id: null,
            tags: { $addToSet: "$label" },
          },
        },
      ])
    )[0]?.tags.sort() || []
  );
}

export default apiHandlerWrapper(handler);

export type AccountTagGetUserTagsApiResponse = InferApiResponse<typeof handler>;

const queryKey = "/api/account-tag/get-user-tags";

export const useAccountTagGetUserTags = () =>
  useQuery(
    [queryKey],
    queryFnWrapper<AccountTagGetUserTagsApiResponse>(queryKey)
  );

export const invalidate_accountTagGetUserTags = async (
  queryClient: QueryClient
) => queryClient.invalidateQueries([queryKey]);
