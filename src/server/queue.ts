import ms from "ms";
import connectDb from "../db/db";
import getTask, { TaskStatus } from "../collections/Task";
import dayjs from "dayjs";

export async function startQueue() {
  await connectDb();
  let Task = getTask();

  setInterval(() => {
    void Task.updateMany(
      {
        status: TaskStatus.IN_PROGRESS,
        updatedAt: {
          $lte: dayjs().subtract(10, "minutes").toDate(),
        },
      },
      {
        $set: {
          status: TaskStatus.TIMEOUT,
        },
      }
    );
  }, ms("1m"));
}
