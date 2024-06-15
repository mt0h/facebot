import { getUserFromCookies } from "@italodeandra/auth/collections/user/User.service";
import {
  apiHandlerWrapper,
  InferApiArgs,
  InferApiResponse,
  mutationFnWrapper,
} from "@italodeandra/next/api/apiHandlerWrapper";
import { conflict, unauthorized } from "@italodeandra/next/api/errors";
import {
  useMutation,
  UseMutationOptions,
  useQueryClient,
} from "@tanstack/react-query";
import { NextApiRequest, NextApiResponse } from "next";
import connectToDb from "../../../db/db";
import Jsonify from "@italodeandra/next/utils/Jsonify";
import removeEmptyProperties from "@italodeandra/next/utils/removeEmptyProperties";
import getAccountGroup, {
  IAccountGroup,
} from "../../../collections/AccountGroup";
import isomorphicObjectId from "@italodeandra/next/utils/isomorphicObjectId";
import { invalidate_accountGroupList } from "./list";

async function handler(
  args: Jsonify<Pick<IAccountGroup, "name" | "id" | "accountId">>,
  req: NextApiRequest,
  res: NextApiResponse
) {
  await connectToDb();
  let AccountGroup = getAccountGroup();
  const user = await getUserFromCookies(req, res);
  if (!user) {
    throw unauthorized(res, { user });
  }

  if (
    await AccountGroup.countDocuments({
      userId: user._id,
      id: args.id,
    })
  ) {
    throw conflict;
  }

  let doc: Parameters<typeof AccountGroup.insertOne>[0] = {
    ...args,
    id:
      /https:\/\/www\.facebook\.com\/groups\/(?<id>.+)\//g.exec(`${args.id}/`)
        ?.groups?.id || args.id,
    userId: user._id,
    accountId: isomorphicObjectId(args.accountId),
  };

  removeEmptyProperties(doc);

  let inserted = await AccountGroup.insertOne(doc);

  return { _id: inserted._id };
}

export default apiHandlerWrapper(handler);

export type AccountGroupCreateResponse = InferApiResponse<typeof handler>;
export type AccountGroupCreateArgs = InferApiArgs<typeof handler>;

const mutationKey = "/api/account-group/create";

export const useAccountGroupCreate = (
  options?: UseMutationOptions<
    AccountGroupCreateResponse,
    { code: number },
    AccountGroupCreateArgs
  >
) => {
  const queryClient = useQueryClient();
  return useMutation(
    [mutationKey],
    mutationFnWrapper<AccountGroupCreateArgs, AccountGroupCreateResponse>(
      mutationKey
    ),
    {
      ...options,
      async onSuccess(...params) {
        await invalidate_accountGroupList(queryClient);
        await options?.onSuccess?.(...params);
      },
    }
  );
};
