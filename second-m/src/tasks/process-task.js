import { logger } from "../logger/winstone.js";

export async function processTask(task) {
  const param = task.param;
  logger.debug(`Processing task with param: ${param}`);

  await new Promise(resolve => setTimeout(resolve, 5000));

  const result = param * 2;
  logger.debug(`Task processed, result: ${result}`);

  return result;
}
