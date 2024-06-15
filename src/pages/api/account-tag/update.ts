import { getUserFromCookies } from "@italodeandra/auth/collections/user/User.service";
import {
  apiHandlerWrapper,
  InferApiArgs,
  InferApiResponse,
  mutationFnWrapper,
} from "@italodeandra/next/api/apiHandlerWrapper";
import { notFound, unauthorized } from "@italodeandra/next/api/errors";
import isomorphicObjectId from "@italodeandra/next/utils/isomorphicObjectId";
import {
  useMutation,
  UseMutationOptions,
  useQueryClient,
} from "@tanstack/react-query";
import { NextApiRequest, NextApiResponse } from "next";
import connectToDb from "../../../db/db";
import { AccountTagCreateArgs } from "./create";
import { invalidate_accountTagList } from "./list";
import removeEmptyProperties from "@italodeandra/next/utils/removeEmptyProperties";
import { omit } from "lodash";
import getAccountTag from "../../../collections/AccountTag";

async function handler(
  args: { _id: string } & AccountTagCreateArgs,
  req: NextApiRequest,
  res: NextApiResponse
) {
  await connectToDb();
  let AccountTag = getAccountTag();
  const user = await getUserFromCookies(req, res);
  if (!user) {
    throw unauthorized(res, { user });
  }

  const _id = isomorphicObjectId(args._id);

  let $set: Parameters<typeof AccountTag.findOneAndUpdate>[1]["$set"] = {
    ...omit(args, ["_id"]),
    accountId: isomorphicObjectId(args.accountId),
    groupsIds: args.groupsIds?.map(isomorphicObjectId),
  };
  let $unset = removeEmptyProperties($set);

  const updated = await AccountTag.findOneAndUpdate(
    {
      _id,
    },
    {
      $set,
      $unset,
    }
  );

  if (!updated) {
    throw notFound;
  }

  return { _id: updated._id };
}

export default apiHandlerWrapper(handler);

export type AccountTagUpdateResponse = InferApiResponse<typeof handler>;
export type AccountTagUpdateArgs = InferApiArgs<typeof handler>;

const mutationKey = "/api/account-tag/update";

export const useAccountTagUpdate = (
  options?: UseMutationOptions<
    AccountTagUpdateResponse,
    unknown,
    AccountTagUpdateArgs
  >
) => {
  const queryClient = useQueryClient();
  return useMutation(
    [mutationKey],
    mutationFnWrapper<AccountTagUpdateArgs, AccountTagUpdateResponse>(
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
