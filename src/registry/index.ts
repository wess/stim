import type { StimManifest } from '../types/index.js'

export type Source = {
  owner: string
  repo: string
  subpath: string | null
  tag: string | null
}

export const parseSource = (source: string): Source => {
  const match = source.match(/^github\/([^/@]+)\/([^/@]+)(?:\/([^@]+))?(?:@(.+))?$/)

  if (!match) {
    throw new Error(`Invalid package source: ${source}\nExpected format: github/<user>/<repo>[/<subpath>][@tag]`)
  }

  return {
    owner: match[1],
    repo: match[2],
    subpath: match[3] ? match[3].replace(/\/$/, '') : null,
    tag: match[4] || null,
  }
}

export const sourceKey = (s: Source): string => {
  return s.subpath ? `github/${s.owner}/${s.repo}/${s.subpath}` : `github/${s.owner}/${s.repo}`
}

export const resolveTag = async (owner: string, repo: string, tag: string | null): Promise<string> => {
  if (tag) return tag

  const latestUrl = `https://api.github.com/repos/${owner}/${repo}/releases/latest`
  const latestRes = await fetch(latestUrl)

  if (latestRes.ok) {
    const data = await latestRes.json()
    if (data.tag_name) return data.tag_name
  }

  const tagsUrl = `https://api.github.com/repos/${owner}/${repo}/tags`
  const tagsRes = await fetch(tagsUrl)

  if (tagsRes.ok) {
    const tags = await tagsRes.json()
    if (Array.isArray(tags) && tags.length > 0) return tags[0].name
  }

  throw new Error(`Could not resolve tag for ${owner}/${repo}: no releases or tags found`)
}

const joinPath = (...parts: (string | null)[]): string =>
  parts.filter(Boolean).join('/').replace(/\/+/g, '/')

export const fetchManifest = async (
  owner: string,
  repo: string,
  tag: string,
  subpath: string | null = null,
): Promise<StimManifest> => {
  const label = subpath ? `${owner}/${repo}/${subpath}@${tag}` : `${owner}/${repo}@${tag}`
  const yamlPath = joinPath(subpath, 'stim.yaml')
  const yamlUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${tag}/${yamlPath}`
  const yamlRes = await fetch(yamlUrl)

  if (yamlRes.ok) {
    return Bun.YAML.parse(await yamlRes.text()) as StimManifest
  }

  const jsonPath = joinPath(subpath, 'stim.json')
  const jsonUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${tag}/${jsonPath}`
  const jsonRes = await fetch(jsonUrl)

  if (!jsonRes.ok) {
    throw new Error(`Failed to fetch stim.yaml or stim.json from ${label} (${jsonRes.status})`)
  }

  return jsonRes.json()
}

export const fetchStimFile = async (
  owner: string,
  repo: string,
  tag: string,
  filename: string,
  subpath: string | null = null,
): Promise<string> => {
  const path = joinPath(subpath, filename)
  const url = `https://raw.githubusercontent.com/${owner}/${repo}/${tag}/${path}`
  const res = await fetch(url)

  if (!res.ok) {
    const label = subpath ? `${owner}/${repo}/${subpath}@${tag}` : `${owner}/${repo}@${tag}`
    throw new Error(`Failed to fetch ${filename} from ${label} (${res.status})`)
  }

  return res.text()
}
