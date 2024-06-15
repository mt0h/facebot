import { getFullUserFromCookies } from "@italodeandra/auth/collections/user/User.service";
import {
  apiHandlerWrapper,
  InferApiResponse,
  queryFnWrapper,
} from "@italodeandra/next/api/apiHandlerWrapper";
import { unauthorized } from "@italodeandra/next/api/errors";
import { QueryClient, useQuery, UseQueryOptions } from "@tanstack/react-query";
import { NextApiRequest, NextApiResponse } from "next";
import connectToDb from "../../../db/db";
import { defaultSettings } from "../../../collections/settings/defaultSettings";
import { merge } from "lodash";

async function handler(_args: void, req: NextApiRequest, res: NextApiResponse) {
  await connectToDb();
  let user = await getFullUserFromCookies(req, res);
  if (!user) {
    throw unauthorized(res, { user });
  }

  return merge(defaultSettings, user.customData?.settings);
}

export default apiHandlerWrapper(handler);

export type SettingsGetApiResponse = InferApiResponse<typeof handler>;

const queryKey = "/api/settings/get";

export const useSettingsGet = (
  options?: UseQueryOptions<SettingsGetApiResponse>
) =>
  useQuery<SettingsGetApiResponse>(
    [queryKey],
    queryFnWrapper<SettingsGetApiResponse>(queryKey),
    options
  );

export const invalidate_settingsGet = (queryClient: QueryClient) =>
  queryClient.invalidateQueries([queryKey]);
