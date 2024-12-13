import 'dotenv/config';
import { BotConfig } from '../config';
import { getInfo } from 'discord-hybrid-sharding';
import { ExtendedClient } from '../structure';
import { databaseInit } from '../database';
import { webSocketInit } from './websocket';

const client = new ExtendedClient({
  ...BotConfig.CLIENT_OPTION,
  shards: getInfo().SHARD_LIST,
  shardCount: getInfo().TOTAL_SHARDS,
});

(async () => {
  await databaseInit();
  await webSocketInit();
  await client.start();
})();
