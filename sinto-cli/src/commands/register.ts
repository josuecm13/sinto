/**
 * MODULE: Register Command
 * Commander command `sinto register`; prompts name/email/password, calls POST /auth/register, saves credentials.
 *
 * Endpoints: POST /auth/register — create account
 *
 * Exports: registerCommand
 * Depends on: @clack/prompts, lib/api, lib/credentials
 */
import { Command } from 'commander'
import * as p from '@clack/prompts'
import { apiPost, ApiError } from '../lib/api'
import { saveCredentials } from '../lib/credentials'

interface RegisterResponse {
  user: { id: string; name: string; email: string }
  accessToken: string
  refreshToken: string
}

export const registerCommand = new Command('register')
  .description('Create a new Sinto account')
  .option('--name <name>', 'Account name')
  .option('--email <email>', 'Email address')
  .option('--password <password>', 'Password')
  .action(async (options) => {
    // Non-interactive path: if all three flags provided, skip prompts
    if (options.name && options.email && options.password) {
      p.intro('Create your Sinto account')

      // Validation
      if (options.name.length < 2) {
        p.cancel('Name must be at least 2 characters')
        process.exit(1)
      }
      if (!options.email.includes('@')) {
        p.cancel('Enter a valid email')
        process.exit(1)
      }
      if (options.password.length < 8) {
        p.cancel('Password must be at least 8 characters')
        process.exit(1)
      }

      const spinner = p.spinner()
      spinner.start('Creating account...')

      try {
        const res = await apiPost<RegisterResponse>('/auth/register', {
          name: options.name,
          email: options.email,
          password: options.password,
        })

        saveCredentials({
          email: res.user.email,
          accessToken: res.accessToken,
          refreshToken: res.refreshToken,
        })

        spinner.stop('Account created!')
        p.outro(`Welcome, ${res.user.name}! You are now logged in.`)
      } catch (err) {
        spinner.stop('Failed.')
        if (err instanceof ApiError) {
          p.cancel(`${err.message} (${err.code})`)
        } else {
          p.cancel('Could not reach the API. Is the server running?')
        }
        process.exit(1)
      }
      return
    }

    // Interactive path: existing flow unchanged
    p.intro('Create your Sinto account')

    const fields = await p.group(
      {
        name: () =>
          p.text({ message: 'Your name', placeholder: 'Ana García', validate: (v) =>
            v.trim().length < 2 ? 'Name must be at least 2 characters' : undefined,
          }),
        email: () =>
          p.text({ message: 'Email', placeholder: 'ana@example.com', validate: (v) =>
            !v.includes('@') ? 'Enter a valid email' : undefined,
          }),
        password: () =>
          p.password({ message: 'Password (min 8 chars)', validate: (v) =>
            v.length < 8 ? 'Password must be at least 8 characters' : undefined,
          }),
        confirm: () => p.password({ message: 'Confirm password' }),
      },
      { onCancel: () => { p.cancel('Cancelled.'); process.exit(0) } },
    )

    if (fields.password !== fields.confirm) {
      p.cancel('Passwords do not match.')
      process.exit(1)
    }

    const spinner = p.spinner()
    spinner.start('Creating account...')

    try {
      const res = await apiPost<RegisterResponse>('/auth/register', {
        name: fields.name,
        email: fields.email,
        password: fields.password,
      })

      saveCredentials({
        email: res.user.email,
        accessToken: res.accessToken,
        refreshToken: res.refreshToken,
      })

      spinner.stop('Account created!')
      p.outro(`Welcome, ${res.user.name}! You are now logged in.`)
    } catch (err) {
      spinner.stop('Failed.')
      if (err instanceof ApiError) {
        p.cancel(`${err.message} (${err.code})`)
      } else {
        p.cancel('Could not reach the API. Is the server running?')
      }
      process.exit(1)
    }
  })
