# Context

The vocabulary this project uses for its own concepts. Use these terms verbatim in code, tests, issues and commits.

## Terms

### Person

The site owner's identity facts that pages render from — name, job title, employer, school, contact links, and image.

Avoid: "author", "profile", "owner config".

### Deploy contract

The headers, redirects and 404 behaviour the site promises in production, as declared in `netlify.toml`.

Avoid: "deploy config", "netlify settings", "the toml".

### Netlify emulator

The module that serves the built site under the deploy contract during tests, so the contract can be exercised without deploying.

Avoid: "static server", "mock Netlify", "test server".

### Build output

The files Hugo writes to the publish directory, which the deploy contract is applied to.

Avoid: "dist", "artifacts", "public folder".
