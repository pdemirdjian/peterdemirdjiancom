import { createServer } from 'node:http'
import { readFileSync, statSync } from 'node:fs'
import { join, resolve, sep } from 'node:path'
import { createNetlifySite, parseDeployContract } from './netlify-site.mts'
import { TEST_PORT } from './config.mts'

// Process adapter for the Netlify emulator: reads the environment, parses the
// deploy contract out of netlify.toml, backs the emulator's readFile seam with
// the built site under public/, and bridges node:http to and from it. All
// serving behaviour lives in netlify-site.mts.

export function createPublishServer(publishDir = process.env.PUBLISH_DIR ?? 'public') {
  const root = resolve(publishDir)

  // Reads a site-relative path under public/. Paths that resolve outside the
  // publish directory have no file, the same as paths that do not exist.
  function readSiteFile(path: string): Uint8Array | null {
    const candidate = resolve(join(root, path))
    if (candidate !== root && !candidate.startsWith(root + sep)) return null
    try {
      if (!statSync(candidate).isFile()) return null
      return readFileSync(candidate)
    } catch {
      return null
    }
  }

  const site = createNetlifySite({
    readFile: readSiteFile,
    contract: parseDeployContract(readFileSync(resolve('netlify.toml'), 'utf8')),
  })

  return createServer(async (req, res) => {
    // req.url is the raw request target; the emulator matches rules against it
    // undecoded, exactly as Netlify does.
    const response = site(req.url ?? '/')
    const body = Buffer.from(await response.arrayBuffer())
    res.writeHead(response.status, Object.fromEntries(response.headers))
    res.end(body)
  })
}

if (import.meta.main) {
  const server = createPublishServer()
  const port = Number(process.env.PORT ?? TEST_PORT)
  server.listen(port, () => {
    console.log(`Netlify emulator serving on http://localhost:${port}`)
  })
}
