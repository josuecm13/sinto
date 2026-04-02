#!/usr/bin/env node
/**
 * MODULE: CLI Entry Point
 * Registers all Commander commands, handles banner/help, launches TUI when invoked with no args.
 *
 * Exports: (none)
 * Depends on: commander, picocolors, all commands, tui/app
 */
import { Command } from 'commander'
import pc from 'picocolors'
import { loadCredentials } from './lib/credentials'
import { registerCommand } from './commands/register'
import { loginCommand } from './commands/login'
import { meCommand } from './commands/me'
import { cycleCommand } from './commands/cycle'
import { logCommand } from './commands/log'
import { phaseCommand } from './commands/phase'
import { predictCommand } from './commands/predict'
import { runApp } from './tui/app'

function printBanner() {
  const line = pc.dim('─'.repeat(44))
  console.log()
  console.log(`  ${pc.magenta('◆')} ${pc.bold(pc.white('sinto'))} ${pc.dim('— Sintotérmico cycle tracker')}`)
  console.log(`  ${line}`)
  const creds = loadCredentials()
  if (creds) {
    console.log(`  ${pc.dim('Logged in as')} ${pc.cyan(creds.email)}`)
    if (creds.activeCycleId) {
      console.log(`  ${pc.dim('Active cycle')}  ${pc.cyan(creds.activeCycleId)}`)
    }
  } else {
    console.log(`  ${pc.dim('Not logged in')}`)
  }
  console.log()
}

function printHelp() {
  console.log(`  ${pc.bold('Auth')}`)
  console.log(`    ${pc.cyan('register')}            Create a new account`)
  console.log(`    ${pc.cyan('login')}               Log in to your account`)
  console.log()
  console.log(`  ${pc.bold('Profile')}`)
  console.log(`    ${pc.cyan('me')}                  Show your profile`)
  console.log()
  console.log(`  ${pc.bold('Cycles')}`)
  console.log(`    ${pc.cyan('cycle list')}          List all cycles`)
  console.log(`    ${pc.cyan('cycle start')}         Start a new cycle`)
  console.log(`    ${pc.cyan('cycle show')} [id]     Show cycle details & logs`)
  console.log(`    ${pc.cyan('cycle close')} [id]    Close the current cycle`)
  console.log(`    ${pc.cyan('cycle use')} <id>      Set active cycle`)
  console.log(`    ${pc.cyan('cycle delete')} <id>   Delete a cycle`)
  console.log()
  console.log(`  ${pc.bold('Daily Log')}`)
  console.log(`    ${pc.cyan('log add')}             Log today's symptoms`)
  console.log(`    ${pc.cyan('log list')}            List logs for active cycle`)
  console.log()
  console.log(`  ${pc.bold('Phases & Prediction')}`)
  console.log(`    ${pc.cyan('phase')}               Current phase info`)
  console.log(`    ${pc.cyan('phase')} <name>        Phase guide (menstrual|folicular|ovulatoria|lutea)`)
  console.log(`    ${pc.cyan('predict')}             Fertility window & probability`)
  console.log()
  console.log(`  ${pc.dim('Options:')} ${pc.cyan('-v')} version  ${pc.cyan('-h')} help`)
  console.log()
}

const program = new Command()

program
  .name('sinto')
  .version('0.1.0', '-v, --version')
  .helpOption('-h, --help')
  .configureOutput({
    writeOut: () => {},
    writeErr: (str) => process.stderr.write(str),
  })

program.addCommand(registerCommand)
program.addCommand(loginCommand)
program.addCommand(meCommand)
program.addCommand(cycleCommand)
program.addCommand(logCommand)
program.addCommand(phaseCommand)
program.addCommand(predictCommand)

const args = process.argv.slice(2)
const isHelp = args[0] === '--help' || args[0] === '-h'
const isVersion = args[0] === '--version' || args[0] === '-v'

if (isVersion) {
  console.log('0.1.0')
  process.exit(0)
}

if (isHelp) {
  printBanner()
  printHelp()
  process.exit(0)
}

// No subcommand → launch interactive TUI
if (args.length === 0) {
  runApp().catch((err) => {
    console.error(pc.red('\n  Error inesperado:'), err)
    process.exit(1)
  })
} else {
  program.parse()
}
