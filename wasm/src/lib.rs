use wasm_bindgen::prelude::*;
use serde::{Deserialize, Serialize};
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

// Helper function to log messages
#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

// No need to explicitly export memory, WebAssembly does it automatically
