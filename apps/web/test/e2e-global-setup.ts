import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(currentDir, "../..");

const runCompose = (args: string[]) => {
  const result = spawnSync("docker", ["compose", ...args], {
    cwd: repoRoot,
    stdio: "inherit"
  });

  if (result.status !== 0) {
    throw new Error(`docker compose ${args.join(" ")} failed with status ${result.status}`);
  }
};

const waitForHttp = async (url: string, label: string) => {
  const deadline = Date.now() + 120_000;

  while (Date.now() < deadline) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return;
      }
    } catch {
      // Retry until timeout.
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  throw new Error(`Timed out waiting for ${label} at ${url}`);
};

export default async function globalSetup() {
  runCompose(["down", "-v", "--remove-orphans"]);
  runCompose(["up", "-d", "--build"]);

  await waitForHttp("http://localhost:3001/health", "API health");
  await waitForHttp("http://localhost:5173", "web app");
}
