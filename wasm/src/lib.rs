use wasm_bindgen::prelude::*;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

// Initialize panic hook for better error messages
#[wasm_bindgen(start)]
pub fn start() {
    console_error_panic_hook::set_once();
}

// Define the environment variables structure
#[derive(Serialize, Deserialize)]
pub struct Environment {
    state_id: String,
    event_name: String,
    event_payload: String,
    settings: String,
    auth_token: String,
    ref_value: String,
    signature: String,
    command: String,
    plugin_github_token: String,
    kernel_public_key: String,
    log_level: String,
    supabase_url: String,
    supabase_key: String,
}

// Main entry point for the WASM module
#[wasm_bindgen]
pub fn process_event(env_json: &str) -> String {
    // Parse the environment variables
    let env: Environment = match serde_json::from_str(env_json) {
        Ok(env) => env,
        Err(e) => {
            return format!("{{\"error\": \"Failed to parse environment: {}\"}}", e);
        }
    };

    // Log the start of execution
    log("Plugin execution started");

    // Log environment variables (redacting sensitive ones)
    log("Environment variables:");
    log(&format!("STATE_ID: {}", env.state_id));
    log(&format!("EVENT_NAME: {}", env.event_name));
    log(&format!("EVENT_PAYLOAD: {}", env.event_payload));
    log(&format!("SETTINGS: {}", env.settings));
    log(&format!("AUTH_TOKEN: {}", if !env.auth_token.is_empty() { "[REDACTED]" } else { "undefined" }));
    log(&format!("REF: {}", env.ref_value));
    log(&format!("SIGNATURE: {}", env.signature));
    log(&format!("COMMAND: {}", env.command));
    log(&format!("PLUGIN_GITHUB_TOKEN: {}", if !env.plugin_github_token.is_empty() { "[REDACTED]" } else { "undefined" }));
    log(&format!("KERNEL_PUBLIC_KEY: {}", if !env.kernel_public_key.is_empty() { "[REDACTED]" } else { "undefined" }));
    log(&format!("LOG_LEVEL: {}", env.log_level));
    log(&format!("SUPABASE_URL: {}", if !env.supabase_url.is_empty() { "[REDACTED]" } else { "undefined" }));
    log(&format!("SUPABASE_KEY: {}", if !env.supabase_key.is_empty() { "[REDACTED]" } else { "undefined" }));

    // Process the event
    log("Processing event...");

    // Parse the event payload
    let event_payload = if !env.event_payload.is_empty() {
        match serde_json::from_str::<HashMap<String, serde_json::Value>>(&env.event_payload) {
            Ok(payload) => {
                log("Event payload parsed successfully");
                payload
            },
            Err(e) => {
                let error_msg = format!("Error processing event: {}", e);
                log(&error_msg);
                return format!("{{\"error\": \"{}\"}}", error_msg);
            }
        }
    } else {
        log("No event payload provided");
        HashMap::new()
    };

    // Add your plugin logic here
    // ...

    // Return success
    log("Plugin execution completed successfully");
    format!("{{\"success\": true, \"message\": \"Plugin execution completed successfully\"}}")
}

// Helper function to log messages
#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}
