use wasm_bindgen::prelude::*;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

// Initialize panic hook for better error messages
#[wasm_bindgen(start)]
pub fn start() {
    console_error_panic_hook::set_once();
}

// Define the issue content structure
#[derive(Serialize, Deserialize)]
pub struct IssueContent {
    title: String,
    body: String,
}

// Define the label mapping structure
#[derive(Serialize, Deserialize)]
pub struct LabelMapping {
    #[serde(flatten)]
    mapping: HashMap<String, Vec<String>>,
}

// Match labels function exposed to JavaScript
#[wasm_bindgen(js_name = "match_labels")]
pub fn match_labels(content_json: &str, mapping_json: &str) -> String {
    // Parse the input JSON
    let content: IssueContent = match serde_json::from_str(content_json) {
        Ok(content) => content,
        Err(e) => return format!("{{\"error\":\"Failed to parse content: {}\"}}", e),
    };

    let mapping: LabelMapping = match serde_json::from_str(mapping_json) {
        Ok(mapping) => mapping,
        Err(e) => return format!("{{\"error\":\"Failed to parse mapping: {}\"}}", e),
    };

    // Combine title and body for matching
    let full_content = format!("{} {}", content.title, content.body).to_lowercase();

    // Find matching labels
    let mut matching_labels = Vec::new();

    for (label, keywords) in &mapping.mapping {
        let matches = keywords.iter().any(|keyword| {
            full_content.contains(&keyword.to_lowercase())
        });

        if matches {
            matching_labels.push(label.clone());
        }
    }

    // Return the matching labels as JSON
    match serde_json::to_string(&matching_labels) {
        Ok(json) => json,
        Err(e) => format!("{{\"error\":\"Failed to serialize result: {}\"}}", e),
    }
}

// Helper function to log messages
#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}
