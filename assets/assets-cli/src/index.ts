import { createInterface } from 'node:readline'

import { program }         from 'commander'
import logger              from 'npmlog'

import { run }             from './run.js'

logger.heading = 'figma-assets'
program
  .option('-o, --output [output]', 'Output dir')
  .option('-v, --verbose', 'Verbose output')
  .arguments('<fileId> <documentId>')
  .parse(process.argv)

const fileId = program.args.at(0)
const documentId = program.args.at(1)
const options = program.opts()

if (options.verbose) {
  logger.level = 'verbose'
}

if (!fileId) {
  logger.error('fileId', 'Figma file id required.')
} else if (!documentId) {
  logger.error('documentId', 'Figma document id required.')
} else {
  const readline = createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  readline.question(`Enter your Figma access token:\n`, (id) => {
    if (!id || id === '') throw Error('ID must not be empty')
    // eslint-disable-next-line dot-notation
    process.env['FIGMA_TOKEN'] = id

    readline.close()

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    run(fileId, documentId, options.output)
      .then((): void => {
        logger.info('run', 'Assets successful generated')
      })
      .catch((error): void => {
        logger.error('error', error.message)
      })
  })
}
