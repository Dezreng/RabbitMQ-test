import express from "express";
import amqp from "amqplib";
import { processTask } from "./tasks/process-task.js";
import { logger } from "./logger/winstone.js";


const app = express();
app.use(express.json());

const PORT = process.env.PORT || 4002;

connectQueue() // call connectQueue function
async function connectQueue() {
  try {
    const connection = await amqp.connect("amqp://localhost:5672");
    const channel = await connection.createChannel();

    await channel.assertQueue("task");

    channel.consume("task", async (msg) => {
      const task = JSON.parse(msg.content.toString());
      logger.debug(`Received task from RabbitMQ: ${JSON.stringify(task)}`);

      const result = await processTask(task);

      channel.sendToQueue(task.callbackQueue, Buffer.from(JSON.stringify({ result })), {
        correlationId: task.correlationId,
      });

      logger.debug(`Result sent to RabbitMQ: ${JSON.stringify({ result })}`);
      channel.ack(msg);
    });

  } catch (error) {
    logger.error(`Error processing task: ${error}`);
    res.status(500).json({ error: 'An error occurred' });
  }
}

app.listen(PORT, () => console.log("Server running at port " + PORT));