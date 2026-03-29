/**
 * Cloudflare Worker entry point
 *
 * For apps without image optimization, use vinext/server/app-router-entry
 * directly in wrangler.jsonc: "main": "vinext/server/app-router-entry"
 */
import { runCron } from "@/lib/cron";
import handler from "vinext/server/app-router-entry";

export default {
    fetch: handler.fetch,

	/**
	 * Scheduled Handler
	 *
	 * Can be tested with:
	 * - `wrangler dev --test-scheduled`
	 * - `curl "http://localhost:8787/__scheduled?cron=*+*+*+*+*"`
	 * @param event
	 */
    async scheduled() {
        await runCron();
    },
};