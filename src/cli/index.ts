import { defineCommand, runMain } from 'citty';
import { description, name, version } from '../../package.json';

import { exampleCommand } from './commands/example';
import { initCommand } from './commands/init';
import { runCommand } from './commands/run';

const main = defineCommand({
  meta: {
    name,
    version,
    description,
  },
  subCommands: {
    run: runCommand,
    init: initCommand,
    example: exampleCommand,
  },
});

runMain(main);
