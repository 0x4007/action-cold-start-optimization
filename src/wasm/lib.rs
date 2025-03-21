use wasm_bindgen::prelude::*;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::collections::HashMap;

// Initialize panic hook for better error messages
// This is optimized to run only once at startup
static mut PANIC_HOOK_INITIALIZED: bool = false;

#[wasm_bindgen(start)]
pub fn start() {
    // Only initialize the panic hook once
    unsafe {
        if !PANIC_HOOK_INITIALIZED {
            console_error_panic_hook::set_once();
            PANIC_HOOK_INITIALIZED = true;
        }
    }
}

// Define the environment variables structure
// Using Box<str> instead of String for better memory efficiency
#[derive(Serialize, Deserialize)]
pub struct Environment {
    state_id: Box<str>,
    event_name: Box<str>,
    event_payload: Box<str>,
    settings: Box<str>,
    auth_token: Box<str>,
    ref_value: Box<str>,
    signature: Box<str>,
    command: Box<str>,
    plugin_github_token: Box<str>,
    kernel_public_key: Box<str>,
    log_level: Box<str>,
    supabase_url: Box<str>,
    supabase_key: Box<str>,
}

// Main entry point for the WASM module
// Optimized for faster execution and reduced memory allocations
#[wasm_bindgen(js_name = "process_event")]
pub fn process_event(env_json: &str) -> String {
    // Parse the environment variables with minimal allocations
    let env: Environment = match serde_json::from_str(env_json) {
        Ok(env) => env,
        Err(e) => {
            return format!("{{\"error\":\"Failed to parse environment: {}\"}}", e);
        }
    };

    // Log the start of execution
    log("Plugin execution started");

    // Process the event with minimal logging for faster execution
    log("Processing event...");

    // Parse the event payload only if needed
    if !env.event_payload.is_empty() {
        match serde_json::from_str::<HashMap<String, serde_json::Value>>(&env.event_payload) {
            Ok(_) => {
                log("Event payload parsed successfully");

                // Add your plugin logic here
                // ...

                // Return success with minimal string formatting
                log("Plugin execution completed successfully");
                return "{\"success\":true,\"message\":\"Plugin execution completed successfully\"}".to_string();
            },
            Err(e) => {
                let error_msg = format!("Error processing event: {}", e);
                log(&error_msg);
                return format!("{{\"error\":\"{}\"}}", error_msg);
            }
        }
    } else {
        log("No event payload provided");

        // Add your plugin logic here for no payload case
        // ...

        // Return success
        log("Plugin execution completed successfully");
        return "{\"success\":true,\"message\":\"Plugin execution completed successfully\"}".to_string();
    }
}

// Parse JSON with optimized memory usage
#[wasm_bindgen(js_name = "parse_json")]
pub fn parse_json(json: &str) -> String {
    match serde_json::from_str::<Value>(json) {
        Ok(value) => serde_json::to_string(&value).unwrap_or_else(|_| "{}".to_string()),
        Err(e) => format!("{{\"error\":\"Failed to parse JSON: {}\"}}", e)
    }
}

// Validate payload against schema
#[wasm_bindgen(js_name = "validate_payload")]
pub fn validate_payload(schema: &str, payload: &str) -> i32 {
    let schema_result = serde_json::from_str::<Value>(schema);
    let payload_result = serde_json::from_str::<Value>(payload);

    if schema_result.is_err() || payload_result.is_err() {
        return 0; // Invalid
    }

    // Simple validation logic - can be enhanced with JSON Schema validation
    1 // Valid
}

// Compute hash of data
#[wasm_bindgen(js_name = "compute_hash")]
pub fn compute_hash(data: &str) -> String {
    use sha2::{Sha256, Digest};

    let mut hasher = Sha256::new();
    hasher.update(data.as_bytes());
    let result = hasher.finalize();

    // Convert to hex string
    let hex: String = result.iter()
        .map(|b| format!("{:02x}", b))
        .collect();

    hex
}

// Helper function to log messages
#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

// No need to explicitly export memory, WebAssembly does it automatically
