/**
 * MODULE: Login Command
 * Commander command `sinto login`; prompts email/password, calls POST /auth/login, saves credentials.
 *
 * Endpoints: POST /auth/login — authenticate user
 *
 * Exports: loginCommand
 * Depends on: @clack/prompts, lib/api, lib/credentials
 */
import { Command } from 'commander'
import * as p from '@clack/prompts'
import { apiPost, ApiError } from '../lib/api'
import { saveCredentials } from '../lib/credentials'

interface LoginResponse {
  user: { id: string; name: string; email: string }
  accessToken: string
  refreshToken: string
}

export const loginCommand = new Command('login')
  .description('Log in to your Sinto account')
  .action(async () => {
    p.intro('Log in to Sinto')

    const fields = await p.group(
      {
        email: () =>
          p.text({ message: 'Email', placeholder: 'ana@example.com', validate: (v) =>
            !v.includes('@') ? 'Enter a valid email' : undefined,
          }),
        password: () => p.password({ message: 'Password' }),
      },
      { onCancel: () => { p.cancel('Cancelled.'); process.exit(0) } },
    )

    const spinner = p.spinner()
    spinner.start('Logging in...')

    try {
      const res = await apiPost<LoginResponse>('/auth/login', {
        email: fields.email,
        password: fields.password,
      })

      saveCredentials({
        email: res.user.email,
        accessToken: res.accessToken,
        refreshToken: res.refreshToken,
      })

      spinner.stop('Logged in!')
      p.outro(`Welcome back, ${res.user.name}!`)
    } catch (err) {
      spinner.stop('Failed.')
      if (err instanceof ApiError) {
        p.cancel(err.status === 401 ? 'Invalid email or password.' : `${err.message} (${err.code})`)
      } else {
        p.cancel('Could not reach the API. Is the server running?')
      }
      process.exit(1)
    }
  })
