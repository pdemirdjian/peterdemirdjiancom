import assert from 'node:assert/strict'
import path from 'node:path'
import { test } from 'node:test'

import { Linter } from 'eslint'

import formatter from './sarif-formatter.js'

const cwd = process.cwd()

const eslintResult = (overrides = {}) => ({
  filePath: path.join(cwd, 'docs/.vuepress/client.ts'),
  messages: [],
  ...overrides,
})

test('produces a valid SARIF 2.1.0 log with an ESLint driver', () => {
  const sarif = JSON.parse(formatter([eslintResult()]))

  assert.equal(sarif.version, '2.1.0')
  assert.ok(sarif.$schema.includes('sarif'))
  assert.equal(sarif.runs[0].tool.driver.name, 'ESLint')
})

test('maps severity 2 to error and severity 1 to warning', () => {
  const result = eslintResult({
    messages: [
      { ruleId: 'no-unused-vars', severity: 2, message: 'Unused var', line: 3, column: 5 },
      { ruleId: 'vue/order-in-components', severity: 1, message: 'Bad order', line: 8, column: 1 },
    ],
  })

  const { results } = JSON.parse(formatter([result])).runs[0]

  assert.equal(results.length, 2)
  assert.equal(results[0].level, 'error')
  assert.equal(results[0].ruleId, 'no-unused-vars')
  assert.equal(results[0].message.text, 'Unused var')
  assert.equal(results[1].level, 'warning')
})

test('reports file locations as repo-relative URIs with line and column', () => {
  const result = eslintResult({
    messages: [{ ruleId: 'semi', severity: 2, message: 'Missing semicolon', line: 12, column: 7 }],
  })

  const [sarifResult] = JSON.parse(formatter([result])).runs[0].results
  const location = sarifResult.locations[0].physicalLocation

  assert.equal(location.artifactLocation.uri, 'docs/.vuepress/client.ts')
  assert.equal(location.region.startLine, 12)
  assert.equal(location.region.startColumn, 7)
})

test('handles fatal parse errors with null ruleId and missing position', () => {
  const result = eslintResult({
    messages: [{ ruleId: null, fatal: true, severity: 2, message: 'Parsing error: Unexpected token' }],
  })

  const [sarifResult] = JSON.parse(formatter([result])).runs[0].results

  assert.equal(sarifResult.level, 'error')
  assert.equal(sarifResult.ruleId, 'eslint-fatal')
  assert.equal(sarifResult.message.text, 'Parsing error: Unexpected token')
  assert.equal(sarifResult.locations[0].physicalLocation.region.startLine, 1)
})

test('files with no messages produce no results', () => {
  const { results } = JSON.parse(formatter([eslintResult()])).runs[0]

  assert.deepEqual(results, [])
})

test('reports the running ESLint version as the tool driver version', () => {
  const { driver } = JSON.parse(formatter([eslintResult()])).runs[0].tool

  assert.equal(driver.version, Linter.version)
})

test('uses context.cwd, not process.cwd(), to compute relative URIs', () => {
  const result = {
    filePath: '/some/project/root/src/index.js',
    messages: [{ ruleId: 'semi', severity: 2, message: 'Missing semicolon', line: 1, column: 1 }],
  }

  const [sarifResult] = JSON.parse(formatter([result], { cwd: '/some/project/root' })).runs[0].results

  assert.equal(sarifResult.locations[0].physicalLocation.artifactLocation.uri, 'src/index.js')
})

test('populates rule description and help URI from context.rulesMeta', () => {
  const result = eslintResult({
    messages: [{ ruleId: 'no-unused-vars', severity: 2, message: 'Unused var', line: 1, column: 1 }],
  })
  const context = {
    cwd,
    rulesMeta: {
      'no-unused-vars': {
        docs: {
          description: 'Disallow unused variables',
          url: 'https://eslint.org/docs/latest/rules/no-unused-vars',
        },
      },
    },
  }

  const [rule] = JSON.parse(formatter([result], context)).runs[0].tool.driver.rules

  assert.equal(rule.id, 'no-unused-vars')
  assert.equal(rule.shortDescription.text, 'Disallow unused variables')
  assert.equal(rule.helpUri, 'https://eslint.org/docs/latest/rules/no-unused-vars')
})

test('registers each rule once even when it fires multiple times', () => {
  const result = eslintResult({
    messages: [
      { ruleId: 'no-console', severity: 1, message: 'No console', line: 1, column: 1 },
      { ruleId: 'no-console', severity: 1, message: 'No console', line: 5, column: 3 },
    ],
  })

  const run = JSON.parse(formatter([result])).runs[0]

  assert.equal(run.results.length, 2)
  assert.equal(run.tool.driver.rules.filter((rule) => rule.id === 'no-console').length, 1)
})

test('produces results from every file in a multi-file run', () => {
  const fileA = eslintResult({
    filePath: path.join(cwd, 'docs/.vuepress/config.js'),
    messages: [{ ruleId: 'semi', severity: 2, message: 'Missing semicolon', line: 1, column: 1 }],
  })
  const fileB = eslintResult({
    messages: [{ ruleId: 'no-console', severity: 1, message: 'No console', line: 2, column: 1 }],
  })

  const { results } = JSON.parse(formatter([fileA, fileB])).runs[0]

  const uris = results.map((result) => result.locations[0].physicalLocation.artifactLocation.uri)
  assert.deepEqual(uris, ['docs/.vuepress/config.js', 'docs/.vuepress/client.ts'])
})
