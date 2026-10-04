import { readFileSync } from 'node:fs'
import { parse } from 'smol-toml'

type Person = {
  email: string
  phone: string
  linkedin: string
  github: string
}

type HeroAction = { name: string } & (
  | { url: string; person?: never }
  | { person: keyof Person; url?: never }
)

const config = parse(readFileSync('hugo.toml', 'utf8')) as unknown as {
  title: string
  menus: { main: Array<{ name: string; url: string; weight: number }> }
  params: { person: Person; heroActions: HeroAction[] }
}

export const siteTitle = config.title
export const menuEntries = [...config.menus.main].sort((a, b) => a.weight - b.weight)
export const person = config.params.person
export const heroActions = config.params.heroActions.map((action) => ({
  name: action.name,
  url: action.person === undefined
    ? action.url
    : action.person === 'email' ? `mailto:${person.email}` : person[action.person],
}))
