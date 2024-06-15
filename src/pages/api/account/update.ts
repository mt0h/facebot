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
import { AccountCreateArgs } from "./create";
import { invalidate_accountGet } from "./get";
import { invalidate_accountList } from "./list";
import getAccount from "../../../collections/Account";
import removeEmptyProperties from "@italodeandra/next/utils/removeEmptyProperties";
import { omit } from "lodash";

async function handler(
  args: { _id: string; mainAccountId?: string } & Partial<AccountCreateArgs>,
  req: NextApiRequest,
  res: NextApiResponse
) {
  await connectToDb();
  let Account = getAccount();
  const user = await getUserFromCookies(req, res);
  if (!user) {
    throw unauthorized(res, { user });
  }

  const _id = isomorphicObjectId(args._id);

  let $set: Parameters<typeof Account.findOneAndUpdate>[1]["$set"] = {
    ...omit(args, ["_id", "facebookCookies", "browserCookies"]),
    mainAccountId: args.mainAccountId
      ? isomorphicObjectId(args.mainAccountId)
      : undefined,
  };
  let $unset = removeEmptyProperties($set);

  const updated = await Account.findOneAndUpdate(
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

export type AccountUpdateResponse = InferApiResponse<typeof handler>;
export type AccountUpdateArgs = InferApiArgs<typeof handler>;

const mutationKey = "/api/account/update";

export const useAccountUpdate = (
  options?: UseMutationOptions<
    AccountUpdateResponse,
    unknown,
    AccountUpdateArgs
  >
) => {
  const queryClient = useQueryClient();
  return useMutation(
    [mutationKey],
    mutationFnWrapper<AccountUpdateArgs, AccountUpdateResponse>(mutationKey),
    {
      ...options,
      async onSuccess(...params) {
        const [, args] = params;
        await invalidate_accountList(queryClient);
        await invalidate_accountGet(queryClient, args);
        await options?.onSuccess?.(...params);
      },
    }
  );
};
