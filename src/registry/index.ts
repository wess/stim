import type { StimManifest } from '../types/index.js'

export const parseSource = (source: string): { owner: string, repo: string, tag: string | null } => {
  const match = source.match(/^github\/([^/@]+)\/([^/@]+)(?:@(.+))?$/)

  if (!match) {
    throw new Error(`Invalid package source: ${source}\nExpected format: github/<user>/<repo>[@tag]`)
  }

  return {
    owner: match[1],
    repo: match[2],
    tag: match[3] || null,
  }
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

export const fetchManifest = async (owner: string, repo: string, tag: string): Promise<StimManifest> => {
  const url = `https://raw.githubusercontent.com/${owner}/${repo}/${tag}/stim.json`
  const res = await fetch(url)

  if (!res.ok) {
    throw new Error(`Failed to fetch stim.json from ${owner}/${repo}@${tag} (${res.status})`)
  }

  return res.json()
}

export const fetchStimFile = async (owner: string, repo: string, tag: string, filename: string): Promise<string> => {
  const url = `https://raw.githubusercontent.com/${owner}/${repo}/${tag}/${filename}`
  const res = await fetch(url)

  if (!res.ok) {
    throw new Error(`Failed to fetch ${filename} from ${owner}/${repo}@${tag} (${res.status})`)
  }

  return res.text()
}
