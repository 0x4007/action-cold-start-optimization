// This file provides utilities for working with inlined WebAssembly
// Instead of loading WASM from disk, we'll decode it from a base64 string

// The base64-encoded WebAssembly will be injected here during the build process
// This is just a placeholder that will be replaced by the actual base64 string
export const WASM_BASE64 = 'WASM_BASE64_PLACEHOLDER';

/**
 * Decodes a base64 string to a Uint8Array
 */
export function decodeBase64(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Creates a WebAssembly module from a base64-encoded string
 */
export async function instantiateWasmFromBase64(
  base64: string,
  importObject: WebAssembly.Imports = {}
): Promise<WebAssembly.Instance> {
  // Decode the base64 string to a Uint8Array
  const wasmBytes = decodeBase64(base64);

  // Compile and instantiate the WebAssembly module
  const module = await WebAssembly.compile(wasmBytes);
  return WebAssembly.instantiate(module, importObject);
}
