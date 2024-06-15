import { getFullUserFromCookies } from "@italodeandra/auth/collections/user/User.service";
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
import { invalidate_accountList } from "./list";
import connectToDb from "../../../db/db";
import Jsonify from "@italodeandra/next/utils/Jsonify";
import getAccount, { IAccount } from "../../../collections/Account";
import removeEmptyProperties from "@italodeandra/next/utils/removeEmptyProperties";

async function handler(
  args: Jsonify<
    Pick<
      IAccount,
      "facebookCookies" | "browserCookies" | "notes" | "id" | "name" | "error"
    >
  >,
  req: NextApiRequest,
  res: NextApiResponse
) {
  await connectToDb();
  let Account = getAccount();
  const user = await getFullUserFromCookies(req, res);
  if (!user) {
    throw unauthorized(res, { user });
  }

  let accountLimit = user.customData?.accountLimit || 0;
  let accountCount = await Account.countDocuments({
    userId: user._id,
  });

  if (accountCount > accountLimit) {
    throw unauthorized;
  }

  if (
    await Account.countDocuments({
      userId: user._id,
      id: args.id,
    })
  ) {
    throw conflict;
  }

  let doc: Parameters<typeof Account.insertOne>[0] = {
    ...args,
    userId: user._id,
    version: 2,
  };

  removeEmptyProperties(doc);

  let inserted = await Account.insertOne(doc);

  return { _id: inserted._id };
}

export default apiHandlerWrapper(handler);

export type AccountCreateResponse = InferApiResponse<typeof handler>;
export type AccountCreateArgs = InferApiArgs<typeof handler>;

const mutationKey = "/api/account/create";

export const useAccountCreate = (
  options?: UseMutationOptions<
    AccountCreateResponse,
    { code: number },
    AccountCreateArgs
  >
) => {
  const queryClient = useQueryClient();
  return useMutation(
    [mutationKey],
    mutationFnWrapper<AccountCreateArgs, AccountCreateResponse>(mutationKey),
    {
      ...options,
      async onSuccess(...params) {
        await invalidate_accountList(queryClient);
        await options?.onSuccess?.(...params);
      },
    }
  );
};
