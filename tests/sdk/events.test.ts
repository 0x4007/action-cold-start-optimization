import { describe, test, expect, beforeEach, afterEach, mock, spyOn } from "bun:test";
import { events, EventHandler, EventPayload } from "../../src/sdk/events.js";

describe("Event System", () => {
  // Create a mock context object
  const mockContext = {
    github: {},
    env: {},
    utils: {},
    log: () => {}
  };

  // Reset event handlers before each test
  beforeEach(() => {
    // Since events is a singleton, we need to clear any handlers from previous tests
    const eventNames = ["test.event", "another.event", "once.event", "async.event"];
    eventNames.forEach(eventName => {
      events.off(eventName);
    });
  });

  test("should register and trigger event handler with on()", async () => {
    // Arrange
    let handlerCalled = false;
    const handlerFn = () => { handlerCalled = true; };
    const event = "test.event";
    const payload: EventPayload = { id: 123 };

    // Act
    events.on(event, handlerFn);
    await events.trigger(event, payload, mockContext as any);

    // Assert
    expect(handlerCalled).toBe(true);
  });

  test("should handle multiple handlers for the same event", async () => {
    // Arrange
    let handler1Called = false;
    let handler2Called = false;
    const handler1 = () => { handler1Called = true; };
    const handler2 = () => { handler2Called = true; };
    const event = "test.event";
    const payload: EventPayload = { id: 456 };

    // Act
    events.on(event, handler1);
    events.on(event, handler2);
    await events.trigger(event, payload, mockContext as any);

    // Assert
    expect(handler1Called).toBe(true);
    expect(handler2Called).toBe(true);
  });

  test("should unregister specific event handler with off()", async () => {
    // Arrange
    let handler1Called = false;
    let handler2Called = false;
    const handler1 = () => { handler1Called = true; };
    const handler2 = () => { handler2Called = true; };
    const event = "test.event";
    const payload: EventPayload = { id: 789 };

    // Act
    events.on(event, handler1);
    events.on(event, handler2);
    events.off(event, handler1);
    await events.trigger(event, payload, mockContext as any);

    // Assert
    expect(handler1Called).toBe(false);
    expect(handler2Called).toBe(true);
  });

  test("should unregister all handlers for an event with off()", async () => {
    // Arrange
    let handler1Called = false;
    let handler2Called = false;
    const handler1 = () => { handler1Called = true; };
    const handler2 = () => { handler2Called = true; };
    const event = "test.event";
    const payload: EventPayload = { id: 999 };

    // Act
    events.on(event, handler1);
    events.on(event, handler2);
    events.off(event); // Unregister all handlers
    await events.trigger(event, payload, mockContext as any);

    // Assert
    expect(handler1Called).toBe(false);
    expect(handler2Called).toBe(false);
  });

  test("should call handler only once with once()", async () => {
    // Arrange
    let callCount = 0;
    const handler = () => { callCount++; };
    const event = "once.event";
    const payload: EventPayload = { id: 111 };

    // Act
    events.once(event, handler);

    // First trigger
    await events.trigger(event, payload, mockContext as any);

    // Second trigger
    await events.trigger(event, payload, mockContext as any);

    // Assert
    expect(callCount).toBe(1);
  });

  test("should support async handlers", async () => {
    // Arrange
    let completed = false;
    const asyncHandler: EventHandler = async () => {
      await new Promise(resolve => setTimeout(resolve, 10));
      completed = true;
    };
    const event = "async.event";

    // Act
    events.on(event, asyncHandler);
    await events.trigger(event, {}, mockContext as any);

    // Assert
    expect(completed).toBe(true);
  });

  test("should trigger only handlers for the specified event", async () => {
    // Arrange
    let handler1Called = false;
    let handler2Called = false;
    const handler1 = () => { handler1Called = true; };
    const handler2 = () => { handler2Called = true; };
    const event1 = "test.event";
    const event2 = "another.event";
    const payload: EventPayload = { id: 222 };

    // Act
    events.on(event1, handler1);
    events.on(event2, handler2);
    await events.trigger(event1, payload, mockContext as any);

    // Assert
    expect(handler1Called).toBe(true);
    expect(handler2Called).toBe(false);
  });
});
