import { getUserFromCookies } from "@italodeandra/auth/collections/user/User.service";
import {
  apiHandlerWrapper,
  InferApiResponse,
  queryFnWrapper,
} from "@italodeandra/next/api/apiHandlerWrapper";
import { unauthorized } from "@italodeandra/next/api/errors";
import { QueryClient, useQuery, UseQueryOptions } from "@tanstack/react-query";
import { NextApiRequest, NextApiResponse } from "next";
import connectToDb from "../../../db/db";
import getAccount, { IAccount } from "../../../collections/Account";
import { invalidate_accountListPages } from "./list-pages";

async function handler(_args: void, req: NextApiRequest, res: NextApiResponse) {
  await connectToDb();
  const Account = getAccount();
  const user = await getUserFromCookies(req, res);
  if (!user) {
    throw unauthorized(res, { user });
  }

  return Account.aggregate<
    Pick<IAccount, "_id" | "name" | "facebookCookies" | "notes" | "id"> & {
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
        mainAccount: "$mainAccount.name",
        tags: "$tags.label",
        facebookCookies: 1,
        notes: 1,
        id: 1,
      },
    },
  ]);
}

export default apiHandlerWrapper(handler);

export type AccountListBackupApiResponse = InferApiResponse<typeof handler>;

const queryKey = "/api/account/list-backup";

export const useAccountListBackup = (
  options?: UseQueryOptions<AccountListBackupApiResponse>
) =>
  useQuery<AccountListBackupApiResponse>(
    [queryKey],
    queryFnWrapper(queryKey),
    options
  );

export const invalidate_accountListBackup = async (
  queryClient: QueryClient
) => {
  await invalidate_accountListPages(queryClient);
  return queryClient.invalidateQueries([queryKey]);
};
