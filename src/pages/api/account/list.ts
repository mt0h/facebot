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
import getAccount, { IAccount } from "../../../collections/Account";
import { invalidate_accountListPages } from "./list-pages";
import { invalidate_accountListBackup } from "./list-backup";

async function handler(_args: void, req: NextApiRequest, res: NextApiResponse) {
  await connectToDb();
  const Account = getAccount();
  const user = await getUserFromCookies(req, res);
  if (!user) {
    throw unauthorized(res, { user });
  }

  return Account.aggregate<
    Pick<IAccount, "_id" | "id" | "name" | "tabs" | "version" | "error"> & {
      mainAccount: string;
      tags: string[];
    }
  >([
    {
      $match: {
        userId: user._id,
      },
    },
    {
      $sort: {
        updatedAt: -1,
      },
    },
    {
      $lookup: {
        from: "accounts",
        localField: "mainAccountId",
        foreignField: "_id",
        as: "mainAccount",
      },
    },
    {
      $unwind: {
        path: "$mainAccount",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "accountTags",
        localField: "_id",
        foreignField: "accountId",
        as: "tags",
      },
    },
    {
      $project: {
        name: 1,
        tabs: 1,
        mainAccount: "$mainAccount.name",
        tags: "$tags.label",
        version: 1,
        id: 1,
        error: 1,
      },
    },
  ]);
}

export default apiHandlerWrapper(handler);

export type AccountListApiArgs = InferApiArgs<typeof handler>;
export type AccountListApiResponse = InferApiResponse<typeof handler>;

const queryKey = "/api/account/list";

export const useAccountList = (args?: AccountListApiArgs) =>
  useQuery([queryKey], queryFnWrapper<AccountListApiResponse>(queryKey, args));

export const invalidate_accountList = async (queryClient: QueryClient) => {
  await invalidate_accountListPages(queryClient);
  await invalidate_accountListBackup(queryClient);
  return queryClient.invalidateQueries([queryKey]);
};
