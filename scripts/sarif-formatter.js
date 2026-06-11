import path from 'node:path'

import { Linter } from 'eslint'
import { SarifBuilder, SarifResultBuilder, SarifRuleBuilder, SarifRunBuilder } from 'node-sarif-builder'

const SEVERITY_LEVELS = { 1: 'warning', 2: 'error' }

export default function sarifFormatter(results, context) {
  const cwd = context?.cwd ?? process.cwd()
  const rulesMeta = context?.rulesMeta ?? {}

  const runBuilder = new SarifRunBuilder().initSimple({
    toolDriverName: 'ESLint',
    toolDriverVersion: Linter.version,
    url: 'https://eslint.org',
  })

  const seenRules = new Set()

  for (const result of results) {
    const fileUri = path.relative(cwd, result.filePath).split(path.sep).join('/')

    for (const message of result.messages) {
      if (message.ruleId && !seenRules.has(message.ruleId)) {
        seenRules.add(message.ruleId)
        const meta = rulesMeta[message.ruleId]
        runBuilder.addRule(
          new SarifRuleBuilder().initSimple({
            ruleId: message.ruleId,
            shortDescriptionText: meta?.docs?.description ?? message.ruleId,
            helpUri: meta?.docs?.url,
          }),
        )
      }

      runBuilder.addResult(
        new SarifResultBuilder().initSimple({
          ruleId: message.ruleId ?? 'eslint-fatal',
          level: SEVERITY_LEVELS[message.severity] ?? 'warning',
          messageText: message.message,
          fileUri,
          startLine: message.line || 1,
          startColumn: message.column || 1,
          endLine: message.endLine || undefined,
          endColumn: message.endColumn || undefined,
        }),
      )
    }
  }

  const sarifBuilder = new SarifBuilder()
  sarifBuilder.addRun(runBuilder)
  return sarifBuilder.buildSarifJsonString({ indent: true })
}
