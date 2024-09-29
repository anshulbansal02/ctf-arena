import { connection as dbConnection } from "@/services/db";
import { cache } from "@/services/cache";
import { setupTeamQueues } from "@/services/team/workers";
import { setupContestQueues } from "@/services/contest/workers";
import { setupUserQueues } from "@/services/user/workers";

export async function bootstrap() {
  try {
    console.info(`[Bootstrap] Connecting to database`);
    await dbConnection.connect();
    console.info(`[Bootstrap] Successfully connected to database`);
  } catch (e) {
    console.error(`[Bootstrap] Failed to connect to database: `, e);
    throw e;
  }

  try {
    console.info(`[Bootstrap] Connecting to cache`);
    if (!cache.isOpen) await cache.connect();
    console.info(`[Bootstrap] Successfully connected to cache`);
  } catch (e) {
    console.error(`[Bootstrap] Failed to connect to cache: `, e);
    throw e;
  }

  console.info("[Bootstrap] Instantiating job queues");
  setupTeamQueues();
  setupContestQueues();
  setupUserQueues();

  console.info("[Bootstrap] Bootstrapped app successfully");
}
