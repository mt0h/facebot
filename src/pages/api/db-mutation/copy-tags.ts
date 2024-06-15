import { apiHandlerWrapper } from "@italodeandra/next/api/apiHandlerWrapper";
import connectToDb from "../../../db/db";

async function handler() {
  await connectToDb();
  // const AccountTag = getAccountTag();
  // const Account = getAccount();
  // const AccountGroup = getAccountGroup();
  //
  // let userOldId = new ObjectId("64c71b3771e7d70b46470436");
  // let userNewId = new ObjectId("65e6353e0a6e8be68d733afd");
  //
  // let accountsTags = await AccountTag.find({
  //   userId: userOldId,
  //   label: {
  //     $in: ["ESPANHA", "EUA"],
  //   },
  // });
  // let accounts = await Account.find({
  //   _id: { $in: accountsTags.map((t) => t.accountId) },
  // });
  // let accountGroups = await AccountGroup.find({
  //   accountId: { $in: accounts.map((t) => t._id) },
  // });
  //
  // const accountsNewIds = accounts.map((a) => ({
  //   old: a._id,
  //   new: new ObjectId(),
  // }));
  //
  // await AccountTag.insertMany(
  //   accountsTags.map(({ _id, accountId, ...t }) => ({
  //     ...t,
  //     accountId: accountsNewIds.find((a) => a.old.equals(accountId))!.new,
  //     userId: userNewId,
  //   }))
  // );
  // await Account.insertMany(
  //   accounts.map(({ _id, ...t }) => ({
  //     ...t,
  //     _id: accountsNewIds.find((a) => a.old.equals(_id))!.new,
  //     userId: userNewId,
  //   }))
  // );
  // await AccountGroup.insertMany(
  //   accountGroups.map(({ _id, accountId, ...t }) => ({
  //     ...t,
  //     accountId: accountsNewIds.find((a) => a.old.equals(accountId))!.new,
  //     userId: userNewId,
  //   }))
  // );
}

export default apiHandlerWrapper(handler);
