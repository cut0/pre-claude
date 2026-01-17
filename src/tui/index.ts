import { defineCommand, runMain } from 'citty';

import { version } from '../../package.json';
import { initCommand } from '../cli/commands/init';
import { runCommand } from '../cli/commands/run';

const main = defineCommand({
  meta: {
    name: 'pre-claude',
    version,
    description: 'AI-powered design document generator CLI',
  },
  subCommands: {
    init: initCommand,
    run: runCommand,
  },
});

runMain(main);
