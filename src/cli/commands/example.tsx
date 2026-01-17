import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

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
  const jiti = createJiti(import.meta.url);
  const configModule = await jiti.import(configPath);
  const config = (configModule as { default: Config }).default;

  const result = safeParseConfig(config);
  if (!result.success) {
    const issues = result.issues.map((issue) => {
      const pathStr = issue.path?.map((p) => p.key).join('.') ?? '';
      return `  - ${pathStr}: ${issue.message}`;
    });
    throw new Error(`Invalid config:\n${issues.join('\n')}`);
  }

  return config;
};

export const exampleCommand = defineCommand({
  meta: {
    name: 'example',
    description: 'Run pre-claude with an example config to try it out',
  },
  args: {
    lang: {
      type: 'string',
      description: 'Language for example config (en or ja)',
      alias: 'l',
      default: 'en',
    },
  },
  async run({ args }) {
    const lang = args.lang;

    if (lang !== 'en' && lang !== 'ja') {
      consola.error(`Invalid language: ${lang}. Use 'en' or 'ja'.`);
      process.exit(1);
    }

    // Resolve the path to examples directory relative to this file
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const examplesDir = path.resolve(__dirname, '../../examples');
    const configFileName =
      lang === 'ja' ? 'pre-claude-ja.config.ts' : 'pre-claude.config.ts';
    const configPath = path.join(examplesDir, configFileName);

    try {
      const config = await loadConfig(configPath);

      // Check if terminal supports raw mode
      if (process.stdin.isTTY !== true) {
        throw new Error(
          'TUI requires an interactive terminal. Please run this command in a terminal that supports raw mode.',
        );
      }

      consola.info(
        `Running example with ${lang === 'ja' ? 'Japanese' : 'English'} config...`,
      );

      enterAlternateScreen();

      const { waitUntilExit } = render(<App config={config} />);

      await waitUntilExit();
      exitAlternateScreen();
    } catch (error) {
      exitAlternateScreen();
      if (error instanceof Error) {
        consola.error(error.message);
      } else {
        consola.error('Failed to run example:', error);
      }
      process.exit(1);
    }
  },
});
