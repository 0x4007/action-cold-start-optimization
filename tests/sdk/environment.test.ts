import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import {
  getEnvironment,
  PluginEnvironment,
} from "../../src/sdk/environment.js";

describe("Environment Module", () => {
  // Backup of original environment
  const originalEnv = { ...process.env };

  // Test environment variables
  const testEnvVariables = {
    INPUT_STATEID: "test-state-123",
    INPUT_EVENTNAME: "test.event",
    INPUT_EVENTPAYLOAD: JSON.stringify({ test: "data" }),
    INPUT_SETTINGS: JSON.stringify({ setting1: "value1" }),
    INPUT_AUTHTOKEN: "mock-auth-token",
    INPUT_REF: "refs/heads/main",
    INPUT_SIGNATURE: "mock-signature",
    INPUT_COMMAND: "test-command",
    INPUT_PLUGIN_GITHUB_TOKEN: "mock-github-token",
    INPUT_KERNEL_PUBLIC_KEY: "mock-public-key",
    INPUT_LOG_LEVEL: "debug",
    INPUT_SUPABASE_URL: "https://example.supabase.co",
    INPUT_SUPABASE_KEY: "mock-supabase-key",
  };

  // Environment variable mapping
  const envMapping: Record<string, keyof PluginEnvironment> = {
    INPUT_STATEID: "stateId",
    INPUT_EVENTNAME: "eventName",
    INPUT_EVENTPAYLOAD: "eventPayload",
    INPUT_SETTINGS: "settings",
    INPUT_AUTHTOKEN: "authToken",
    INPUT_REF: "ref",
    INPUT_SIGNATURE: "signature",
    INPUT_COMMAND: "command",
    INPUT_PLUGIN_GITHUB_TOKEN: "pluginGithubToken",
    INPUT_KERNEL_PUBLIC_KEY: "kernelPublicKey",
    INPUT_LOG_LEVEL: "logLevel",
    INPUT_SUPABASE_URL: "supabaseUrl",
    INPUT_SUPABASE_KEY: "supabaseKey",
  };

  beforeEach(() => {
    // Reset environment before each test
    process.env = { ...originalEnv };

    // Clear any mapped environment variables
    Object.keys(envMapping).forEach((key) => {
      delete process.env[key.replace("INPUT_", "")];
    });
  });

  afterEach(() => {
    // Restore original environment
    process.env = { ...originalEnv };
  });

  test("should map GitHub Actions inputs to environment variables", () => {
    // Arrange - Set up GitHub Actions inputs
    Object.entries(testEnvVariables).forEach(([key, value]) => {
      process.env[key] = value;
    });

    // Act
    const env = getEnvironment();

    // Assert - Verify inputs were mapped to environment variables
    Object.entries(testEnvVariables).forEach(([inputKey, inputValue]) => {
      const envKey = envMapping[inputKey];
      expect(env[envKey]).toBe(inputValue);
    });
  });

  test("should return default values when environment variables are not set", () => {
    // Act
    const env = getEnvironment();

    // Assert - Verify default values
    expect(env.stateId).toBe("");
    expect(env.eventName).toBe("");
    expect(env.eventPayload).toBe("");
    expect(env.settings).toBe("");
    expect(env.authToken).toBe("");
    expect(env.ref).toBe("");
    expect(env.signature).toBe("");
    expect(env.command).toBe("");
    expect(env.pluginGithubToken).toBe("");
    expect(env.kernelPublicKey).toBe("");
    expect(env.logLevel).toBe("info"); // Default is "info"
    expect(env.supabaseUrl).toBe("");
    expect(env.supabaseKey).toBe("");
  });

  test("should prioritize environment variables over default values", () => {
    // Arrange - Set only some environment variables
    process.env.EVENT_NAME = "custom.event";
    process.env.LOG_LEVEL = "error";

    // Act
    const env = getEnvironment();

    // Assert - Verify set values are used, others are defaults
    expect(env.eventName).toBe("custom.event");
    expect(env.logLevel).toBe("error");
    expect(env.stateId).toBe(""); // Default
  });

  test("should handle mixed input sources (GitHub Actions inputs and direct env vars)", () => {
    // Arrange - Set some GitHub Actions inputs
    process.env.INPUT_STATEID = "input-state-id";
    process.env.INPUT_EVENTNAME = "input.event";

    // Set some direct environment variables
    process.env.LOG_LEVEL = "direct-log-level";
    process.env.PLUGIN_GITHUB_TOKEN = "direct-github-token";

    // Act
    const env = getEnvironment();

    // Assert - GitHub Actions inputs should be mapped and take precedence
    expect(env.stateId).toBe("input-state-id");
    expect(env.eventName).toBe("input.event");
    expect(env.logLevel).toBe("direct-log-level");
    expect(env.pluginGithubToken).toBe("direct-github-token");
  });

  test("should return all environment properties regardless of what is set", () => {
    // Arrange - Set only one environment variable
    process.env.EVENT_NAME = "single.event";

    // Act
    const env = getEnvironment();

    // Assert - All properties should be present
    expect(env).toHaveProperty("stateId");
    expect(env).toHaveProperty("eventName");
    expect(env).toHaveProperty("eventPayload");
    expect(env).toHaveProperty("settings");
    expect(env).toHaveProperty("authToken");
    expect(env).toHaveProperty("ref");
    expect(env).toHaveProperty("signature");
    expect(env).toHaveProperty("command");
    expect(env).toHaveProperty("pluginGithubToken");
    expect(env).toHaveProperty("kernelPublicKey");
    expect(env).toHaveProperty("logLevel");
    expect(env).toHaveProperty("supabaseUrl");
    expect(env).toHaveProperty("supabaseKey");

    // The specifically set property should have the correct value
    expect(env.eventName).toBe("single.event");
  });
});
