import { describe, test, expect, mock, beforeEach, afterEach } from 'bun:test'
import { parseSource, resolveTag, fetchManifest, fetchStimFile } from '../src/registry/index.js'

describe('parseSource', () => {
  test('parses github/user/repo', () => {
    const result = parseSource('github/wess/brainstorm')
    expect(result).toEqual({ owner: 'wess', repo: 'brainstorm', tag: null })
  })

  test('parses github/user/repo@tag', () => {
    const result = parseSource('github/wess/brainstorm@v1.0.0')
    expect(result).toEqual({ owner: 'wess', repo: 'brainstorm', tag: 'v1.0.0' })
  })

  test('parses tag with complex semver', () => {
    const result = parseSource('github/user/repo@v2.3.4-beta.1')
    expect(result).toEqual({ owner: 'user', repo: 'repo', tag: 'v2.3.4-beta.1' })
  })

  test('throws on missing github prefix', () => {
    expect(() => parseSource('wess/brainstorm')).toThrow('Invalid package source')
  })

  test('throws on empty string', () => {
    expect(() => parseSource('')).toThrow('Invalid package source')
  })

  test('throws on missing repo', () => {
    expect(() => parseSource('github/wess')).toThrow('Invalid package source')
  })

  test('throws on extra slashes', () => {
    expect(() => parseSource('github/wess/brainstorm/extra')).toThrow('Invalid package source')
  })

  test('throws on npm-style source', () => {
    expect(() => parseSource('npm/brainstorm')).toThrow('Invalid package source')
  })

  test('error message includes expected format', () => {
    expect(() => parseSource('bad')).toThrow('Expected format: github/<user>/<repo>[@tag]')
  })
})

describe('resolveTag', () => {
  const originalFetch = globalThis.fetch

  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  test('returns provided tag immediately without fetching', async () => {
    let fetchCalled = false
    globalThis.fetch = (async () => { fetchCalled = true }) as any

    const result = await resolveTag('wess', 'brainstorm', 'v1.0.0')
    expect(result).toBe('v1.0.0')
    expect(fetchCalled).toBe(false)
  })

  test('fetches latest release tag when no tag provided', async () => {
    globalThis.fetch = (async (url: string) => {
      if (url.includes('/releases/latest')) {
        return new Response(JSON.stringify({ tag_name: 'v2.0.0' }), { status: 200 })
      }
      return new Response('', { status: 404 })
    }) as any

    const result = await resolveTag('wess', 'brainstorm', null)
    expect(result).toBe('v2.0.0')
  })

  test('falls back to tags endpoint when releases 404s', async () => {
    globalThis.fetch = (async (url: string) => {
      if (url.includes('/releases/latest')) {
        return new Response('', { status: 404 })
      }
      if (url.includes('/tags')) {
        return new Response(JSON.stringify([{ name: 'v1.5.0' }]), { status: 200 })
      }
      return new Response('', { status: 404 })
    }) as any

    const result = await resolveTag('wess', 'brainstorm', null)
    expect(result).toBe('v1.5.0')
  })

  test('uses first tag from tags list', async () => {
    globalThis.fetch = (async (url: string) => {
      if (url.includes('/releases/latest')) {
        return new Response('', { status: 404 })
      }
      if (url.includes('/tags')) {
        return new Response(JSON.stringify([
          { name: 'v3.0.0' },
          { name: 'v2.0.0' },
          { name: 'v1.0.0' },
        ]), { status: 200 })
      }
      return new Response('', { status: 404 })
    }) as any

    const result = await resolveTag('wess', 'brainstorm', null)
    expect(result).toBe('v3.0.0')
  })

  test('throws when both endpoints fail', async () => {
    globalThis.fetch = (async () => {
      return new Response('', { status: 404 })
    }) as any

    expect(resolveTag('wess', 'brainstorm', null)).rejects.toThrow('no releases or tags found')
  })

  test('throws when tags returns empty array', async () => {
    globalThis.fetch = (async (url: string) => {
      if (url.includes('/releases/latest')) {
        return new Response('', { status: 404 })
      }
      if (url.includes('/tags')) {
        return new Response(JSON.stringify([]), { status: 200 })
      }
      return new Response('', { status: 404 })
    }) as any

    expect(resolveTag('wess', 'brainstorm', null)).rejects.toThrow('no releases or tags found')
  })
})

describe('fetchManifest', () => {
  const originalFetch = globalThis.fetch

  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  test('fetches and parses stim.json', async () => {
    const manifest = { name: 'brainstorm', version: '1.0.0', author: 'wess', commands: ['brainstorm.stim'] }

    globalThis.fetch = (async (url: string) => {
      expect(url).toBe('https://raw.githubusercontent.com/wess/brainstorm/v1.0.0/stim.json')
      return new Response(JSON.stringify(manifest), { status: 200 })
    }) as any

    const result = await fetchManifest('wess', 'brainstorm', 'v1.0.0')
    expect(result).toEqual(manifest)
  })

  test('throws on 404', async () => {
    globalThis.fetch = (async () => {
      return new Response('', { status: 404 })
    }) as any

    expect(fetchManifest('wess', 'brainstorm', 'v1.0.0')).rejects.toThrow('Failed to fetch stim.json')
  })

  test('error includes status code', async () => {
    globalThis.fetch = (async () => {
      return new Response('', { status: 500 })
    }) as any

    expect(fetchManifest('wess', 'brainstorm', 'v1.0.0')).rejects.toThrow('(500)')
  })
})

describe('fetchStimFile', () => {
  const originalFetch = globalThis.fetch

  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  test('fetches raw .stim file content', async () => {
    const stimContent = 'command hello {\n  ask("hi")\n}'

    globalThis.fetch = (async (url: string) => {
      expect(url).toBe('https://raw.githubusercontent.com/wess/brainstorm/v1.0.0/brainstorm.stim')
      return new Response(stimContent, { status: 200 })
    }) as any

    const result = await fetchStimFile('wess', 'brainstorm', 'v1.0.0', 'brainstorm.stim')
    expect(result).toBe(stimContent)
  })

  test('throws on 404', async () => {
    globalThis.fetch = (async () => {
      return new Response('', { status: 404 })
    }) as any

    expect(fetchStimFile('wess', 'brainstorm', 'v1.0.0', 'missing.stim')).rejects.toThrow('Failed to fetch missing.stim')
  })

  test('constructs correct URL with subdirectory file', async () => {
    globalThis.fetch = (async (url: string) => {
      expect(url).toBe('https://raw.githubusercontent.com/wess/repo/v2.0.0/commands/test.stim')
      return new Response('command test {\n}', { status: 200 })
    }) as any

    await fetchStimFile('wess', 'repo', 'v2.0.0', 'commands/test.stim')
  })
})
