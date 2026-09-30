import { readFileSync } from 'node:fs'
import { parseDeployContract } from './netlify-site.mts'

const contract = parseDeployContract(readFileSync('netlify.toml', 'utf8'))
export const policy = contract.headers.find((rule) => rule.for === '/*')
  ?.values['Content-Security-Policy']
if (!policy) throw new Error('Deploy contract is missing Content-Security-Policy')

export const directives = new Map<string, string[]>()
for (const directive of policy.split(';')) {
  const [name, ...sources] = directive.trim().split(/\s+/)
  if (name && !directives.has(name)) directives.set(name, sources)
}

// Concrete host origins only; keywords and bare schemes grant no single origin.
export const origins = new Set(
  [...directives.values()].flat()
    .filter((source) => /^[a-z][a-z\d+.-]*:\/\//i.test(source))
    .map((source) => new URL(source).origin)
)
