import {
  describe,
  test,
  expect,
  beforeEach,
  afterEach,
  mock,
  spyOn,
} from "bun:test";
import { wasmUtils } from "../../src/sdk/wasm-utils.js";
import * as wasmBridge from "../../src/sdk/wasm-bridge.js";

describe("WASM Utilities", () => {
  // Spy for console methods
  let consoleWarnSpy: ReturnType<typeof spyOn>;

  // Mock WASM exports
  const mockWasmExports = {
    process_event: mock((envJson: string) =>
      JSON.stringify({ processed: true }),
    ),
    parse_json: mock((json: string) => json),
    validate_payload: mock((schema: string, payload: string) => 1),
    compute_hash: mock((data: string) => "wasm-hash-result"),
  };

  beforeEach(() => {
    // Spy on console methods
    consoleWarnSpy = spyOn(console, "warn").mockImplementation(() => {});

    // Mock wasm-bridge functions
    spyOn(wasmBridge, "isWasmInitialized").mockReturnValue(true);
    spyOn(wasmBridge, "getWasmExports").mockReturnValue(mockWasmExports);
  });

  afterEach(() => {
    // Restore console methods
    consoleWarnSpy.mockRestore();
  });

  describe("parseJSON", () => {
    test("should call WASM implementation when WASM is initialized", () => {
      // Arrange
      const json = JSON.stringify({ test: "data" });
      mockWasmExports.parse_json.mockReturnValue(json);

      // Act
      const result = wasmUtils.parseJSON(json);

      // Assert
      expect(wasmBridge.isWasmInitialized).toHaveBeenCalled();
      expect(wasmBridge.getWasmExports).toHaveBeenCalled();
      expect(mockWasmExports.parse_json).toHaveBeenCalledWith(json);
      expect(result).toEqual({ test: "data" });
    });

    test("should use native implementation when WASM is not initialized", () => {
      // Arrange
      const json = JSON.stringify({ test: "data" });
      (wasmBridge.isWasmInitialized as any).mockReturnValue(false);

      // Act
      const result = wasmUtils.parseJSON(json);

      // Assert
      expect(wasmBridge.isWasmInitialized).toHaveBeenCalled();
      // Note: The actual implementation of wasmUtils may still call getWasmExports internally
      // even when isWasmInitialized is false, due to how some of these functions are implemented
      // We just need to verify the result is correct
      expect(result).toEqual({ test: "data" });
    });

    test("should fallback to native implementation when WASM implementation fails", () => {
      // Arrange
      const json = JSON.stringify({ test: "data" });
      mockWasmExports.parse_json.mockImplementation(() => {
        throw new Error("WASM error");
      });

      // Act
      const result = wasmUtils.parseJSON(json);

      // Assert
      expect(wasmBridge.isWasmInitialized).toHaveBeenCalled();
      expect(wasmBridge.getWasmExports).toHaveBeenCalled();
      expect(mockWasmExports.parse_json).toHaveBeenCalledWith(json);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        "WASM parse_json failed, using native implementation:",
        expect.any(Error),
      );
      expect(result).toEqual({ test: "data" });
    });

    test("should throw error for invalid JSON", () => {
      // Arrange
      const invalidJson = "{invalid json}";
      (wasmBridge.isWasmInitialized as any).mockReturnValue(false);

      // Act & Assert
      expect(() => wasmUtils.parseJSON(invalidJson)).toThrow(
        "Failed to parse JSON",
      );
    });
  });

  describe("validatePayload", () => {
    test("should call WASM implementation when WASM is initialized", () => {
      // Arrange
      const schema = { type: "object", required: ["test"] };
      const payload = { test: "data" };
      mockWasmExports.validate_payload.mockReturnValue(1);

      // Act
      const result = wasmUtils.validatePayload(schema, payload);

      // Assert
      expect(wasmBridge.isWasmInitialized).toHaveBeenCalled();
      expect(wasmBridge.getWasmExports).toHaveBeenCalled();
      expect(mockWasmExports.validate_payload).toHaveBeenCalledWith(
        JSON.stringify(schema),
        JSON.stringify(payload),
      );
      expect(result).toBe(true);
    });

    test("should use native implementation when WASM is not initialized", () => {
      // Arrange
      const schema = { type: "object", required: ["test"] };
      const payload = { test: "data" };
      (wasmBridge.isWasmInitialized as any).mockReturnValue(false);

      // Act
      const result = wasmUtils.validatePayload(schema, payload);

      // Assert
      expect(wasmBridge.isWasmInitialized).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    test("should fallback to native implementation when WASM implementation fails", () => {
      // Arrange
      const schema = { type: "object", required: ["test"] };
      const payload = { test: "data" };
      mockWasmExports.validate_payload.mockImplementation(() => {
        throw new Error("WASM error");
      });

      // Act
      const result = wasmUtils.validatePayload(schema, payload);

      // Assert
      expect(wasmBridge.isWasmInitialized).toHaveBeenCalled();
      expect(wasmBridge.getWasmExports).toHaveBeenCalled();
      expect(mockWasmExports.validate_payload).toHaveBeenCalledWith(
        JSON.stringify(schema),
        JSON.stringify(payload),
      );
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        "WASM validate_payload failed, using native implementation:",
        expect.any(Error),
      );
      // Native implementation returns true
      expect(result).toBe(true);
    });
  });

  describe("computeHash", () => {
    test("should call WASM implementation when WASM is initialized", () => {
      // Arrange
      const data = "test data";
      mockWasmExports.compute_hash.mockReturnValue("wasm-hash-result");

      // Act
      const result = wasmUtils.computeHash(data);

      // Assert
      expect(wasmBridge.isWasmInitialized).toHaveBeenCalled();
      expect(wasmBridge.getWasmExports).toHaveBeenCalled();
      expect(mockWasmExports.compute_hash).toHaveBeenCalledWith(data);
      expect(result).toBe("wasm-hash-result");
    });

    test("should use native implementation when WASM is not initialized", () => {
      // Arrange
      const data = "test data";
      (wasmBridge.isWasmInitialized as any).mockReturnValue(false);

      // Act
      const result = wasmUtils.computeHash(data);

      // Assert
      expect(wasmBridge.isWasmInitialized).toHaveBeenCalled();
      // Native implementation returns a hash string
      expect(typeof result).toBe("string");
      expect(result.length).toBeGreaterThan(0);
    });

    test("should fallback to native implementation when WASM implementation fails", () => {
      // Arrange
      const data = "test data";
      mockWasmExports.compute_hash.mockImplementation(() => {
        throw new Error("WASM error");
      });

      // Act
      const result = wasmUtils.computeHash(data);

      // Assert
      expect(wasmBridge.isWasmInitialized).toHaveBeenCalled();
      expect(wasmBridge.getWasmExports).toHaveBeenCalled();
      expect(mockWasmExports.compute_hash).toHaveBeenCalledWith(data);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        "WASM compute_hash failed, using native implementation:",
        expect.any(Error),
      );
      // Native implementation returns a hash string
      expect(typeof result).toBe("string");
      expect(result.length).toBeGreaterThan(0);
    });

    test("should consistently generate the same hash for the same input", () => {
      // Arrange
      const data = "test data";
      (wasmBridge.isWasmInitialized as any).mockReturnValue(false);

      // Act
      const hash1 = wasmUtils.computeHash(data);
      const hash2 = wasmUtils.computeHash(data);

      // Assert
      expect(hash1).toBe(hash2);
    });
  });
});
