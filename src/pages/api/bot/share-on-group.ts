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
import getAccountTag from "../../../collections/AccountTag";
import getAccountGroup from "../../../collections/AccountGroup";
import { ObjectId } from "bson";
import { shuffle } from "lodash";

async function handler(
  args: Jsonify<{
    gql?: boolean;
    postUrl: string;
    description: string;
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
  let Tag = getAccountTag();
  let Group = getAccountGroup();
  let AccountTag = getAccountTag();
  const user = await getUserFromCookies(req, res);
  if (!user) {
    throw unauthorized(res, { user });
  }

  let date = new Date(args.date);
  const descriptions = args.description
    .split(
      `
`
    )
    .map((c) => c.trim())
    .filter(Boolean);

  let bot = args.gql ? TaskBot.SHARE_ON_GROUP_GQL : TaskBot.SHARE_ON_GROUP;

  let queue = await Queue.insertOne({
    userId: user._id,
    bot,
    date,
    url: args.postUrl,
    request: {
      tags: args.tags,
      description: args.description,
    },
  });

  try {
    let posts: {
      queueId: ObjectId;
      bot: TaskBot;
      userId: ObjectId;
      status: TaskStatus;
      request: {
        postUrl: string;
        description: string;
        accountId: ObjectId;
        groupId: string;
        groupGqlId?: string;
        tags: string[];
      };
      date: Date;
    }[] = [];

    let descriptionIndex = -1;

    for (let selectedAccount of args.selectedAccounts) {
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

      if (hasSelectedTag) {
        let tags = await Tag.find({
          userId: user._id,
          accountId,
        });
        for (let tag of tags) {
          for (let groupId of tag.groupsIds || []) {
            let group = await Group.findById(groupId);
            if (group) {
              descriptionIndex++;
              if (descriptionIndex > descriptions.length - 1) {
                descriptionIndex = 0;
              }
              let description = descriptions[descriptionIndex];
              posts.push({
                queueId: queue._id,
                bot,
                userId: user._id,
                status: TaskStatus.PENDING,
                request: {
                  postUrl: args.postUrl,
                  description,
                  accountId,
                  groupId: group.id,
                  groupGqlId: group.gqlId,
                  tags: args.tags,
                },
                date,
              });
            }
          }
        }
      }
    }

    if (!posts.length) {
      // noinspection ExceptionCaughtLocallyJS
      throw badRequest;
    }

    await Task.insertMany(shuffle(posts));
  } catch (e) {
    await Queue.deleteOne({
      userId: user._id,
      _id: queue._id,
    });
    throw e;
  }
}

export default apiHandlerWrapper(handler);

export type BotShareOnGroupApiResponse = InferApiResponse<typeof handler>;
export type BotShareOnGroupApiArgs = InferApiArgs<typeof handler>;

const mutationKey = "/api/bot/share-on-group";

export const useBotShareOnGroup = (
  options?: UseMutationOptions<
    BotShareOnGroupApiResponse,
    { code: number },
    BotShareOnGroupApiArgs
  >
) =>
  useMutation(
    [mutationKey],
    mutationFnWrapper<BotShareOnGroupApiArgs, BotShareOnGroupApiResponse>(
      mutationKey
    ),
    {
      ...options,
      retry: false,
    }
  );
