import { describe, test, expect } from 'bun:test'

describe('cli help output', () => {
  test('shows help with no args', async () => {
    const proc = Bun.spawn(['bun', 'run', 'src/main.ts'], {
      cwd: '/Users/wess/Desktop/Dev/stim',
      stdout: 'pipe',
    })
    const output = await new Response(proc.stdout).text()
    await proc.exited

    expect(output).toContain('Usage: stim <command>')
    expect(output).toContain('compile')
    expect(output).toContain('install')
    expect(output).toContain('add')
    expect(output).toContain('remove')
    expect(output).toContain('update')
    expect(output).toContain('help')
  })

  test('shows help with help command', async () => {
    const proc = Bun.spawn(['bun', 'run', 'src/main.ts', 'help'], {
      cwd: '/Users/wess/Desktop/Dev/stim',
      stdout: 'pipe',
    })
    const output = await new Response(proc.stdout).text()
    await proc.exited

    expect(output).toContain('Usage: stim <command>')
    expect(output).toContain('add <github/user/repo[@tag]> [--local]')
    expect(output).toContain('remove <github/user/repo> [--local]')
    expect(output).toContain('update [github/user/repo] [--local]')
  })

  test('shows version', async () => {
    const proc = Bun.spawn(['bun', 'run', 'src/main.ts', 'version'], {
      cwd: '/Users/wess/Desktop/Dev/stim',
      stdout: 'pipe',
    })
    const output = await new Response(proc.stdout).text()
    await proc.exited

    expect(output).toContain('Stim v')
  })

  test('exits with error on unknown command', async () => {
    const proc = Bun.spawn(['bun', 'run', 'src/main.ts', 'nonsense'], {
      cwd: '/Users/wess/Desktop/Dev/stim',
      stderr: 'pipe',
    })
    const stderr = await new Response(proc.stderr).text()
    const code = await proc.exited

    expect(code).not.toBe(0)
    expect(stderr).toContain('Unknown command: nonsense')
  })

  test('add with no args shows error', async () => {
    const proc = Bun.spawn(['bun', 'run', 'src/main.ts', 'add'], {
      cwd: '/Users/wess/Desktop/Dev/stim',
      stderr: 'pipe',
    })
    const stderr = await new Response(proc.stderr).text()
    const code = await proc.exited

    expect(code).not.toBe(0)
    expect(stderr).toContain('No package source specified')
  })

  test('remove with no args shows error', async () => {
    const proc = Bun.spawn(['bun', 'run', 'src/main.ts', 'remove'], {
      cwd: '/Users/wess/Desktop/Dev/stim',
      stderr: 'pipe',
    })
    const stderr = await new Response(proc.stderr).text()
    const code = await proc.exited

    expect(code).not.toBe(0)
    expect(stderr).toContain('No package source specified')
  })

  test('compile with no args shows error', async () => {
    const proc = Bun.spawn(['bun', 'run', 'src/main.ts', 'compile'], {
      cwd: '/Users/wess/Desktop/Dev/stim',
      stderr: 'pipe',
    })
    const stderr = await new Response(proc.stderr).text()
    const code = await proc.exited

    expect(code).not.toBe(0)
    expect(stderr).toContain('No input file specified')
  })
})
