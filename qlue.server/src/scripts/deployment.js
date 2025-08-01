#!/usr/bin/env bun

import { spawn } from "child_process";
import { existsSync } from "fs";

console.log("🚀 Starting deployment script...");

// Check if we're in production mode
const isProduction = process.env.NODE_ENV === "production";

async function runCommand(command, args = []) {
  return new Promise((resolve, reject) => {
    console.log(`Running: ${command} ${args.join(" ")}`);
    
    const child = spawn(command, args, {
      stdio: "inherit",
      shell: true
    });

    child.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });

    child.on("error", (error) => {
      reject(error);
    });
  });
}

async function main() {
  try {
    // Install dependencies if needed
    if (!existsSync("node_modules")) {
      console.log("📦 Installing dependencies...");
      await runCommand("bun", ["install"]);
    }

    // Generate Prisma client
    console.log("🔧 Generating Prisma client...");
    await runCommand("bun", ["run", "db:generate"]);

    if (isProduction) {
      console.log("🏗️ Production build...");
      // Add any production-specific build steps here
    }

    // Start the server
    console.log("🚀 Starting server...");
    await runCommand("bun", ["run", "dev"]);

  } catch (error) {
    console.error("❌ Deployment failed:", error.message);
    process.exit(1);
  }
}

main(); 