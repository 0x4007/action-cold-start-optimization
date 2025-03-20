#!/usr/bin/env bun

// Simple test script to verify the GitHub Action works correctly

// Set up mock environment variables to simulate GitHub Actions inputs
process.env.INPUT_STATEID = 'test-state-123';
process.env.INPUT_EVENTNAME = 'test-event';
process.env.INPUT_EVENTPAYLOAD = JSON.stringify({ test: 'data' });
process.env.INPUT_SETTINGS = JSON.stringify({ setting1: 'value1' });
process.env.INPUT_AUTHTOKEN = 'mock-auth-token';
process.env.INPUT_REF = 'refs/heads/main';
process.env.INPUT_SIGNATURE = 'mock-signature';
process.env.INPUT_COMMAND = 'test-command';
process.env.INPUT_PLUGIN_GITHUB_TOKEN = 'mock-github-token';
process.env.INPUT_KERNEL_PUBLIC_KEY = 'mock-public-key';
process.env.INPUT_LOG_LEVEL = 'debug';
process.env.INPUT_SUPABASE_URL = 'https://example.supabase.co';
process.env.INPUT_SUPABASE_KEY = 'mock-supabase-key';

// Import the action
import './dist/index.js';

console.log('Test completed');
