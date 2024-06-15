import { getUserFromCookies } from "@italodeandra/auth/collections/user/User.service";
import {
  apiHandlerWrapper,
  InferApiArgs,
  InferApiResponse,
  mutationFnWrapper,
} from "@italodeandra/next/api/apiHandlerWrapper";
import { badRequest, unauthorized } from "@italodeandra/next/api/errors";
import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { NextApiRequest, NextApiResponse } from "next";
import connectToDb from "../../../db/db";
import Jsonify from "@italodeandra/next/utils/Jsonify";
import getQueue from "../../../collections/Queue";
import getTask, { TaskBot, TaskStatus } from "../../../collections/Task";
import isomorphicObjectId from "@italodeandra/next/utils/isomorphicObjectId";
import asyncMap from "@italodeandra/next/utils/asyncMap";
import getAccountTag from "../../../collections/AccountTag";
import filterTruthy from "@italodeandra/next/utils/filterTruthy";
import { shuffle } from "lodash";

async function handler(
  args: Jsonify<{
    gql?: boolean;
    postUrl: string;
    comments: string;
    like: boolean;
    selectedAccounts: string[];
    tags: string[];
    date: string;
  }>,
  req: NextApiRequest,
  res: NextApiResponse
) {
  await connectToDb();
  let Queue = getQueue();
  let Task = getTask();
  let AccountTag = getAccountTag();
  const user = await getUserFromCookies(req, res);
  if (!user) {
    throw unauthorized(res, { user });
  }

  let comments = args.comments
    .split(
      `
`
    )
    .map((c) => c.trim())
    .filter(Boolean);

  let date = new Date(args.date);

  let bot = args.gql ? TaskBot.POST_COMMENT_GQL : TaskBot.POST_COMMENT;

  let queue = await Queue.insertOne({
    userId: user._id,
    bot,
    date,
    url: args.postUrl,
    request: {
      like: args.like,
      tags: args.tags,
      comments: args.comments,
    },
  });

  try {
    let commentIndex = -1;

    let tasks = filterTruthy(
      await asyncMap(args.selectedAccounts, async (selectedAccount) => {
        let accountId = isomorphicObjectId(selectedAccount);

        let hasSelectedTag = args.tags.length
          ? await AccountTag.countDocuments({
              userId: user._id,
              accountId,
              label: {
                $in: args.tags,
              },
            })
          : 1;
        if (!hasSelectedTag) {
          return null;
        }

        commentIndex++;
        if (commentIndex > comments.length - 1) {
          commentIndex = 0;
        }
        let comment = comments[commentIndex];

        return {
          queueId: queue._id,
          bot,
          userId: user._id,
          status: TaskStatus.PENDING,
          request: {
            postUrl: args.postUrl,
            comment,
            like: args.like,
            accountId,
            tags: args.tags,
          },
          date,
        };
      })
    );

    if (!tasks.length) {
      // noinspection ExceptionCaughtLocallyJS
      throw badRequest;
    }

    await Task.insertMany(shuffle(tasks));
  } catch (e) {
    await Queue.deleteOne({
      userId: user._id,
      _id: queue._id,
    });
    throw e;
  }
}

export default apiHandlerWrapper(handler);

export type BotPostCommentApiResponse = InferApiResponse<typeof handler>;
export type BotPostCommentApiArgs = InferApiArgs<typeof handler>;

const mutationKey = "/api/bot/post-comment";

export const useBotPostComment = (
  options?: UseMutationOptions<
    BotPostCommentApiResponse,
    { code: number },
    BotPostCommentApiArgs
  >
) =>
  useMutation(
    [mutationKey],
    mutationFnWrapper<BotPostCommentApiArgs, BotPostCommentApiResponse>(
      mutationKey
    ),
    {
      ...options,
      retry: false,
    }
  );
