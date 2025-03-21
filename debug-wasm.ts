#!/usr/bin/env bun

import { WASM_BASE64, instantiateWasmFromBase64 } from "./src/wasm-inline.js";

async function debugWasm() {
  try {
    // Import objects required for WASM instantiation
    const importObject = {
      env: {
        // Add any required environment functions here
      },
      console: {
        log: (ptr: number, len: number) => {
          // This will be implemented by the WASM module
          console.log("WASM log:", ptr, len);
        },
      },
    };

    // Instantiate the WASM module from the inlined base64 string
    const wasmInstance = await instantiateWasmFromBase64(
      WASM_BASE64,
      importObject,
    );

    // Log all available exports
    console.log("WebAssembly exports:", Object.keys(wasmInstance.exports));

    // Log the type of each export
    for (const key of Object.keys(wasmInstance.exports)) {
      console.log(
        `Export '${key}' is type: ${typeof (wasmInstance.exports as any)[key]}`,
      );
    }
  } catch (error) {
    console.error("Error debugging WASM:", error);
  }
}

debugWasm();
