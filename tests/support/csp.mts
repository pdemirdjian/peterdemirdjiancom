import { readFileSync } from 'node:fs'
import { parseDeployContract } from './netlify-site.mts'

const contract = parseDeployContract(readFileSync('netlify.toml', 'utf8'))
export const policy = contract.headers.find((rule) => rule.for === '/*')
  ?.values['Content-Security-Policy']
if (!policy) throw new Error('Deploy contract is missing Content-Security-Policy')

export function parseCsp(policy: string) {
  const directives = new Map<string, string[]>()
  for (const directive of policy.split(';')) {
    const [name, ...sources] = directive.trim().split(/\s+/)
    if (name && !directives.has(name)) directives.set(name, sources)
  }

  const origins = new Set<string>()
  for (const source of [...directives.values()].flat()) {
    // Quoted keywords and bare schemes grant no single origin.
    if (/^'[^']+'$/.test(source) || /^[a-z][a-z\d+.-]*:$/i.test(source)) continue
    // Deliberately support only concrete origins; never silently skip host patterns.
    if (/^[a-z][a-z\d+.-]*:\/\/[a-z\d.-]+(?::\d+)?\/?$/i.test(source)) {
      const origin = new URL(source).origin
      if (origin !== 'null') {
        origins.add(origin)
        continue
      }
    }
    throw new Error(`Unsupported CSP source: ${source}`)
  }
  return { directives, origins }
}

export const { directives, origins } = parseCsp(policy)
