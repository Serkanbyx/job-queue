import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { ExpressAdapter } from "@bull-board/express";
import { emailQueue } from "../queues/emailQueue";
import { reportQueue } from "../queues/reportQueue";

export const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath("/admin/queues");

createBullBoard({
  queues: [new BullMQAdapter(emailQueue), new BullMQAdapter(reportQueue)],
  serverAdapter,
});
