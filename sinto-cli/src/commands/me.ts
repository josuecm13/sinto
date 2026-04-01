/**
 * MODULE: Me Command
 * Commander command `sinto me`; fetches GET /users/me and prints profile.
 *
 * Endpoints: GET /users/me — retrieve user profile
 *
 * Exports: meCommand
 * Depends on: @clack/prompts, lib/api, lib/credentials, lib/fmt
 */
import { Command } from 'commander'
import * as p from '@clack/prompts'
import pc from 'picocolors'
import { apiGet } from '../lib/api'
import { requireAuth, loadCredentials } from '../lib/credentials'
import { handleError, section, row } from '../lib/fmt'

interface User {
  id: string
  email: string
  name: string
  username: string | null
  isPublic: boolean
  remindersEnabled: boolean
  reminderTime?: string
}

export const meCommand = new Command('me')
  .description('Show your profile')
  .action(async () => {
    try {
      const creds = requireAuth()

      const spinner = p.spinner()
      spinner.start('Fetching profile...')

      const user = await apiGet<User>('/users/me', creds.accessToken)

      spinner.stop('Done!')

      section('My Profile')
      row('Email', user.email)
      row('Name', user.name)
      row('Username', user.username ?? '—')
      row('Public profile', user.isPublic ? 'Yes' : 'No')
      row('Reminders', user.remindersEnabled ? `Enabled (${user.reminderTime ?? '—'})` : 'Disabled')
      console.log()
    } catch (err) {
      handleError(err, 'fetching profile')
    }
  })
