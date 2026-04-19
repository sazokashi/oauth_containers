import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(currentDir, "../..");

export default async function globalTeardown() {
  spawnSync("docker", ["compose", "down", "-v", "--remove-orphans"], {
    cwd: repoRoot,
    stdio: "inherit"
  });
}
