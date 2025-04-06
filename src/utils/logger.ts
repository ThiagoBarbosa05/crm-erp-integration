import chalk from 'chalk'

export const logger = {
  success: (msg: string) => console.log(chalk.green(msg)),
  info: (msg: string) => console.log(chalk.blue(msg)),
  warn: (msg: string) => console.log(chalk.yellow(msg)),
  error: (msg: string, err?: any) =>
    console.error(
      chalk.red('❌ ' + msg),
      err?.response?.data || err?.message || err,
    ),
}
