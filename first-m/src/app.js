import express from "express";

import { logger } from './logger/winstone.js';
import { connectQueue } from "./rabbit-connect/connect.js";

const app = express();
const PORT = process.env.PORT || 4001;

app.use(express.json());

app.post("/multiplication", async (req, res) => {
  const param = req.body.number;
  const task = { param };
  console.log(typeof task.param);
  if (typeof task.param !== 'number') {
    res.status(500).json({ error: 'An error occurred' });
    return;
  }

  try {
    const { channel, connection } = await connectQueue();
    const correlationId = new Date().getTime().toString();

    await channel.assertQueue("task")
    const callbackQueue = await channel.assertQueue('', { exclusive: true });
    await channel.sendToQueue("task", Buffer.from(JSON.stringify({
      param: task.param,
      callbackQueue: callbackQueue.queue,
      correlationId: correlationId,
    })));

    channel.consume(callbackQueue.queue, (msg) => {
      if (msg.properties.correlationId === correlationId) {
        console.log(msg);
        const result = JSON.parse(msg.content.toString());
        logger.debug(`Received result from RabbitMQ: ${JSON.stringify(result)}`);
        res.json({ result });
        channel.close();
        connection.close();
        console.log("A message is sent to queue")
      }
    });

  } catch (error) {
    logger.error(`Error processing task: ${error}`);
    res.status(500).json({ error: 'An error occurred' });
  }
})


app.listen(PORT, () => console.log("Server running at port " + PORT));