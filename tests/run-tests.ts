#!/usr/bin/env bun

/**
 * Comprehensive test runner for Phase 1 and Phase 2 deliverables
 * This script:
 * 1. Runs all SDK unit tests
 * 2. Tests end-to-end plugin flows
 * 3. Validates Phase 2 components (interactive generator, dev server, etc.)
 * 4. Reports results
 */

import { execSync } from "child_process";
import { existsSync, mkdirSync } from "fs";
import path from "path";

console.log("==================================================");
console.log("=== WebAssembly-Optimized GitHub Actions Tests ===");
console.log("==================================================\n");

// Test phases with descriptions
const testPhases = [
  // Phase 1 Tests
  {
    name: "SDK Unit Tests",
    command: "bun test tests/sdk",
    description:
      "Testing all SDK components: events, context, environment, WASM bridge, and utilities",
  },

  // Phase 2 Tests - Core Components
  {
    name: "Simple End-to-End Plugin Flow",
    command: "bun run tests/test-plugin-flow-simple.ts",
    description: "Testing plugin UI flow with mock GitHub events",
    requiresScreenshots: true,
  },
  {
    name: "Complete Plugin Flow",
    command: "bun run tests/test-plugin-flow.ts",
    description:
      "Testing complete plugin generation, server startup, and UI interaction",
    requiresScreenshots: true,
  },
  {
    name: "Plugin Flow with SDK Fix",
    command: "bun run tests/test-plugin-flow-with-sdk-fix.ts",
    description: "Testing plugin flow with SDK integration fixes",
    requiresScreenshots: true,
  },
];

// Ensure screenshots directory exists
if (!existsSync("screenshots")) {
  console.log("Creating screenshots directory...");
  mkdirSync("screenshots");
}

// Results tracking
const results = {
  pass: 0,
  fail: 0,
  errors: [] as string[],
};

// Run each test phase
for (const phase of testPhases) {
  console.log(`\n=== ${phase.name} ===`);
  console.log(phase.description);
  console.log("-".repeat(phase.name.length + 8));

  try {
    // Execute the test command
    console.log(`Running: ${phase.command}`);
    execSync(phase.command, { stdio: "inherit" });

    console.log(`✅ ${phase.name} completed successfully.`);
    results.pass++;
  } catch (error: any) {
    console.error(`❌ ${phase.name} failed.`);
    results.fail++;
    results.errors.push(
      `${phase.name} failed: ${error?.message || "Unknown error"}`,
    );
  }
}

// Print final results
console.log("\n==================================================");
console.log("=== Test Results ===");
console.log(`Total phases: ${testPhases.length}`);
console.log(`Passed: ${results.pass}`);
console.log(`Failed: ${results.fail}`);

if (results.errors.length > 0) {
  console.log("\n=== Errors ===");
  results.errors.forEach((error, index) => {
    console.log(`${index + 1}. ${error}`);
  });
}

// Exit with appropriate code
if (results.fail > 0) {
  console.log("\n❌ Some tests failed.");
  process.exit(1);
} else {
  console.log("\n✅ All tests passed!");
  process.exit(0);
}
