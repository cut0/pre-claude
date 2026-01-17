import * as fs from 'node:fs';
import * as path from 'node:path';

import { defineCommand } from 'citty';
import { consola } from 'consola';
import { createJiti } from 'jiti';

import { render } from 'ink';
import { type Config, safeParseConfig } from '../../definitions';
import { App } from '../../tui/App';

const enterAlternateScreen = () => {
  process.stdout.write('\x1b[?1049h');
  process.stdout.write('\x1b[H');
};

const exitAlternateScreen = () => {
  process.stdout.write('\x1b[?1049l');
};

const loadConfig = async (configPath: string): Promise<Config> => {
  const absolutePath = path.resolve(process.cwd(), configPath);

  if (!fs.existsSync(absolutePath)) {
    throw new Error(`Config file not found: ${absolutePath}`);
  }

  const jiti = createJiti(import.meta.url);
  const configModule = await jiti.import(absolutePath);
  const config = (configModule as { default: Config }).default;

  const result = safeParseConfig(config);
  if (!result.success) {
    const issues = result.issues.map((issue) => {
      const pathStr = issue.path?.map((p) => p.key).join('.') ?? '';
      return `  - ${pathStr}: ${issue.message}`;
    });
    throw new Error(`Invalid config:\n${issues.join('\n')}`);
  }

  // hooks cannot be validated with valibot, so preserve from original config
  return config;
};

export const runCommand = defineCommand({
  meta: {
    name: 'run',
    description: 'Start the TUI to fill out forms and generate prompts',
  },
  args: {
    config: {
      type: 'string',
      description: 'Path to config file',
      alias: 'c',
      default: 'pre-claude.config.ts',
    },
    scenario: {
      type: 'string',
      description: 'Scenario ID to start with (optional)',
      alias: 's',
    },
  },
  async run({ args }) {
    const configPath = args.config;

    try {
      const config = await loadConfig(configPath);

      // Validate scenario ID if provided
      if (args.scenario != null) {
        const scenario = config.scenarios.find((s) => s.id === args.scenario);
        if (scenario == null) {
          const availableIds = config.scenarios.map((s) => s.id).join(', ');
          throw new Error(
            `Scenario "${args.scenario}" not found. Available: ${availableIds}`,
          );
        }
      }

      // Check if terminal supports raw mode
      if (process.stdin.isTTY !== true) {
        throw new Error(
          'TUI requires an interactive terminal. Please run this command in a terminal that supports raw mode.',
        );
      }

      enterAlternateScreen();

      const { waitUntilExit } = render(
        <App config={config} initialScenarioId={args.scenario} />,
      );

      await waitUntilExit();
      exitAlternateScreen();
    } catch (error) {
      exitAlternateScreen();
      if (error instanceof Error) {
        consola.error(error.message);
      } else {
        consola.error('Failed to run TUI:', error);
      }
      process.exit(1);
    }
  },
});
