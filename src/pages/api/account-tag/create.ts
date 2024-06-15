import { getUserFromCookies } from "@italodeandra/auth/collections/user/User.service";
import {
  apiHandlerWrapper,
  InferApiArgs,
  InferApiResponse,
  mutationFnWrapper,
} from "@italodeandra/next/api/apiHandlerWrapper";
import { unauthorized } from "@italodeandra/next/api/errors";
import {
  useMutation,
  UseMutationOptions,
  useQueryClient,
} from "@tanstack/react-query";
import { NextApiRequest, NextApiResponse } from "next";
import { invalidate_accountTagList } from "./list";
import connectToDb from "../../../db/db";
import Jsonify from "@italodeandra/next/utils/Jsonify";
import removeEmptyProperties from "@italodeandra/next/utils/removeEmptyProperties";
import getAccountTag, { IAccountTag } from "../../../collections/AccountTag";
import isomorphicObjectId from "@italodeandra/next/utils/isomorphicObjectId";

async function handler(
  args: Jsonify<Pick<IAccountTag, "label" | "accountId" | "groupsIds">>,
  req: NextApiRequest,
  res: NextApiResponse
) {
  await connectToDb();
  let AccountTag = getAccountTag();
  const user = await getUserFromCookies(req, res);
  if (!user) {
    throw unauthorized(res, { user });
  }

  let doc: Parameters<typeof AccountTag.insertOne>[0] = {
    ...args,
    accountId: isomorphicObjectId(args.accountId),
    userId: user._id,
    groupsIds: args.groupsIds?.map(isomorphicObjectId),
  };

  removeEmptyProperties(doc);

  let inserted = await AccountTag.insertOne(doc);

  return { _id: inserted._id };
}

export default apiHandlerWrapper(handler);

export type AccountTagCreateResponse = InferApiResponse<typeof handler>;
export type AccountTagCreateArgs = InferApiArgs<typeof handler>;

const mutationKey = "/api/account-tag/create";

export const useAccountTagCreate = (
  options?: UseMutationOptions<
    AccountTagCreateResponse,
    unknown,
    AccountTagCreateArgs
  >
) => {
  const queryClient = useQueryClient();
  return useMutation(
    [mutationKey],
    mutationFnWrapper<AccountTagCreateArgs, AccountTagCreateResponse>(
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
