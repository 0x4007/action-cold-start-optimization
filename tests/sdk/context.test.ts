import { describe, test, expect, beforeEach, afterEach, mock, spyOn } from "bun:test";
import { createContext } from "../../src/sdk/context.js";
import * as environmentModule from "../../src/sdk/environment.js";

describe("Context Module", () => {
  // Backup of original environment
  const originalEnv = { ...process.env };

  // Mock event payload
  const mockEventPayload = JSON.stringify({
    repository: {
      owner: { login: "test-owner" },
      name: "test-repo"
    },
    issue: {
      number: 42,
      title: "Test Issue"
    }
  });

  // Mock environment for testing
  const mockEnvironment = {
    stateId: "test-state-123",
    eventName: "test-event",
    eventPayload: mockEventPayload,
    settings: JSON.stringify({ setting1: "value1" }),
    authToken: "mock-auth-token",
    ref: "refs/heads/main",
    signature: "mock-signature",
    command: "test-command",
    pluginGithubToken: "mock-github-token",
    kernelPublicKey: "mock-public-key",
    logLevel: "debug",
    supabaseUrl: "https://example.supabase.co",
    supabaseKey: "mock-supabase-key"
  };

  // Spies
  let getEnvironmentSpy: ReturnType<typeof spyOn>;
  let consoleLogSpy: ReturnType<typeof spyOn>;

  beforeEach(() => {
    // Mock environment
    getEnvironmentSpy = spyOn(environmentModule, "getEnvironment").mockReturnValue(mockEnvironment);

    // Spy on console.log
    consoleLogSpy = spyOn(console, "log").mockImplementation(() => {});

    // Reset environment variables
    Object.keys(mockEnvironment).forEach(key => {
      process.env[key.toUpperCase()] = undefined;
    });
  });

  afterEach(() => {
    // Restore original environment
    process.env = { ...originalEnv };

    // Restore spies
    getEnvironmentSpy.mockRestore();
    consoleLogSpy.mockRestore();
  });

  test("should create a context with required properties", () => {
    // Act
    const context = createContext();

    // Assert
    expect(context).toBeDefined();
    expect(context.github).toBeDefined();
    expect(context.env).toBeDefined();
    expect(context.utils).toBeDefined();
    expect(context.log).toBeDefined();

    // Verify github property has repo info
    expect(context.github.repo).toBeDefined();
    expect(context.github.createComment).toBeDefined();
    expect(context.github.createIssue).toBeDefined();
  });

  test("should extract repository information from event payload", () => {
    // Act
    const context = createContext();

    // Verify repo info was extracted correctly
    expect(context.github.repo.owner).toBe("test-owner");
    expect(context.github.repo.repo).toBe("test-repo");
  });

  test("should provide fallback values for missing repository info", () => {
    // Arrange - mock empty event payload
    getEnvironmentSpy.mockReturnValueOnce({
      ...mockEnvironment,
      eventPayload: '{}'
    });

    // Act
    const context = createContext();

    // Assert
    expect(context.github.repo.owner).toBe("");
    expect(context.github.repo.repo).toBe("");
  });

  test("should log messages with timestamp and level", () => {
    // Arrange
    const context = createContext();

    // Act
    context.log("Test message");

    // Assert
    expect(consoleLogSpy).toHaveBeenCalled();
    const logCall = consoleLogSpy.mock.calls[0][0];
    expect(logCall).toContain("[INFO]");
    expect(logCall).toContain("Test message");
  });

  test("should support different log levels", () => {
    // Arrange
    const context = createContext();

    // Act
    context.log("Info message", "info");
    context.log("Warning message", "warn");
    context.log("Error message", "error");

    // Assert
    expect(consoleLogSpy).toHaveBeenCalledTimes(3);
    expect(consoleLogSpy.mock.calls[0][0]).toContain("[INFO]");
    expect(consoleLogSpy.mock.calls[1][0]).toContain("[WARN]");
    expect(consoleLogSpy.mock.calls[2][0]).toContain("[ERROR]");
  });

  test("should create GitHub API methods", async () => {
    // Arrange
    const context = createContext();

    // Act & Assert
    // These methods are simplified in the context module, so we just verify they exist
    expect(typeof context.github.createComment).toBe("function");

    // Testing the implementation would log to console
    await context.github.createComment(42, "Test comment");
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining("Creating comment on issue #42"));

    const issueNumber = await context.github.createIssue("Test title", "Test body", ["bug"]);
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining("Creating issue: Test title"));
    expect(issueNumber).toBe(1); // Should return 1 as per mock implementation
  });

  test("should use environment from getEnvironment", () => {
    // Arrange
    const customEnv = {
      ...mockEnvironment,
      stateId: "custom-state-id"
    };
    getEnvironmentSpy.mockReturnValueOnce(customEnv);

    // Act
    const context = createContext();

    // Assert
    expect(getEnvironmentSpy).toHaveBeenCalled();
    expect(context.env).toBe(customEnv);
    expect(context.env.stateId).toBe("custom-state-id");
  });
});
