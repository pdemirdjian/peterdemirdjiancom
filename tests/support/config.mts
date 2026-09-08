// The single definition of the port the built site is served on during tests.
// playwright.config.ts, the Netlify emulator's server entry, and the raw
// request helper in deploy-config.spec.ts all read it from here.
export const TEST_PORT = 8080
export const TEST_HOST = 'localhost'
export const TEST_BASE_URL = `http://${TEST_HOST}:${TEST_PORT}`
