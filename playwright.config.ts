import { defineConfig, devices } from "@playwright/test";

const port = Number(process.env.E2E_PORT || 4173);
const host = process.env.E2E_HOST || "127.0.0.1";
const baseURL = process.env.E2E_BASE_URL || `http://${host}:${port}`;
const slowMo = Number(process.env.E2E_SLOWMO || 0);

export default defineConfig({
	testDir: "./test/e2e",
	timeout: 30_000,
	expect: {
		timeout: 10_000,
	},
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	workers: process.env.CI ? 1 : undefined,
	reporter: [["list"]],
	use: {
		baseURL,
		trace: "on-first-retry",
		launchOptions: slowMo > 0 ? { slowMo } : undefined,
	},
	projects: [
		{
			name: "chromium",
			use: { ...devices["Desktop Chrome"] },
		},
	],
	webServer: process.env.E2E_SKIP_WEBSERVER
		? undefined
		: {
				command: `PUBLIC_RECAPTCHA_SITE_KEY= bunx vite dev --host ${host} --port ${port}`,
				url: baseURL,
				reuseExistingServer: true,
				stdout: "pipe",
				stderr: "pipe",
			},
});
