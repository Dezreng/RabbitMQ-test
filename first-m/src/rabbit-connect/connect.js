import amqp from "amqplib";

async function connectQueue() {
  try {
    const connection = await amqp.connect("amqp://localhost:5672");
    const channel = await connection.createChannel()

    return { channel, connection };
  } catch (error) {
    console.log(error)
  }
}

export { connectQueue }