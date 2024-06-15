import { getUserFromCookies } from "@italodeandra/auth/collections/user/User.service";
import {
  apiHandlerWrapper,
  InferApiArgs,
  mutationFnWrapper,
} from "@italodeandra/next/api/apiHandlerWrapper";
import { unauthorized } from "@italodeandra/next/api/errors";
import {
  useMutation,
  UseMutationOptions,
  useQueryClient,
} from "@tanstack/react-query";
import { NextApiRequest, NextApiResponse } from "next";
import connectToDb from "../../../db/db";
import Jsonify from "@italodeandra/next/utils/Jsonify";
import { ISettings } from "../../../collections/settings/Settings";
import getUser from "@italodeandra/auth/collections/user/User";
import { invalidate_settingsGet } from "./get";

async function handler(
  args: Jsonify<ISettings>,
  req: NextApiRequest,
  res: NextApiResponse
) {
  await connectToDb();
  let User = getUser();
  const user = await getUserFromCookies(req, res);
  if (!user) {
    throw unauthorized(res, { user });
  }

  await User.updateOne(
    {
      _id: user._id,
    },
    {
      $set: {
        "customData.settings": args,
      },
    }
  );
}

export default apiHandlerWrapper(handler);

export type SettingsUpdateArgs = InferApiArgs<typeof handler>;

const mutationKey = "/api/settings/update";

export const useSettingsUpdate = (
  options?: UseMutationOptions<void, Error, SettingsUpdateArgs>
) => {
  const queryClient = useQueryClient();
  return useMutation(
    [mutationKey],
    mutationFnWrapper<SettingsUpdateArgs>(mutationKey),
    {
      ...options,
      async onSuccess(...params) {
        await invalidate_settingsGet(queryClient);
        await options?.onSuccess?.(...params);
      },
    }
  );
};
