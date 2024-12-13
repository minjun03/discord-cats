import WebSocket from 'ws';
import { Controller } from '../websocket/structure';
import { Discord, Log } from '../module';
import { ExtendedClient } from '../structure';
import chalk from 'chalk';

let retry = 0;

export const webSocketInit = async () => {
  if (!process.env.WEBSOCKET_URL) return;
  const cluster = ExtendedClient.client.cluster.id.toString();

  const ws = new WebSocket(process.env.WEBSOCKET_URL);

  await Controller.init();

  ws.on('open', async () => {
    ws.send(
      JSON.stringify({ type: 'login', id: await Discord.clientId(), cluster }),
    );
    retry = 0;
  });

  ws.on('message', (message) => {
    const data = JSON.parse(message.toString());
    if (!data.type) return;
    Controller.list.get(data.type)?.controller.run(data, ws);
  });

  ws.on('error', (err) => {
    Log.error(err, __filename);
    async () => await webSocketRetry();
  });

  ws.on('close', async () => await webSocketRetry());
};

export const webSocketRetry = async () => {
  if (retry < 5) {
    Log.warn(
      `WebSocket Connection Closed in Cluster ${chalk.green(
        `#${ExtendedClient.client.cluster.id.toString()}`,
      )}. Retrying ${chalk.green(++retry)} of ${chalk.green(5)}...`,
    );
    await new Promise((resolve) => setTimeout(resolve, 5000));
    await webSocketInit();
  } else process.kill(process.ppid);
};
