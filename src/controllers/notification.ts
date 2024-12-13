import { io } from "../app";
import { Queue, Worker } from "bullmq";
import dotenv from "dotenv";

dotenv.config();

const redisConnect = {
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT),
  password: process.env.REDIS_PASSWORD,
};
const notificationQueue = new Queue("notifications", {
  connection: redisConnect,
});

export async function sendNotificationToUser(
  title: string,
  subtitle: string,
  body: string,
  userSocketId: string
) {
  try {
    const payload = {
      title,
      subtitle,
      body,
    };
    io.to(userSocketId).emit("notification", payload);
  } catch (error) {
    console.log(
      `Error sending notification to user with socket ID: ${userSocketId}`
    );
  }
}

export async function initializeNotificationWorker() {
  new Worker(
    "notifications",
    async (job) => {
      const { userSocketId, title, subtitle, body } = job.data;
      try {
        await sendNotificationToUser(
          title,
          subtitle,
          body,
          userSocketId
        );
      } catch (error) {
        console.error("Failed to send notification:", error);
      }
    },
    {
      connection: redisConnect,
    }
  );
}

export async function addNotificationJob(
  userSocketId: string,
  title: string,
  subtitle: string,
  body: string,
  delay: number
) {
  try {
    await notificationQueue.add(
      "send-notification",
      {
        userSocketId,
        title,
        subtitle,
        body,
      },
      { delay }
    );
  } catch (error) {
    throw new Error("Failed to add notification job");
  }
}

export async function setMovieReminder(
  userId: string,
  movieTitle: string,
  time: number
) {
  try {
    const title = `Reminder for ${movieTitle}`;
    const subtitle = `Watch in ${time} minutes`;
    const body = `Remember to watch this interesting movie`;
    await addNotificationJob(userId, title, subtitle, body, time);
  } catch (error) {
    throw new Error("Failed to set movie reminder");
  }
}
