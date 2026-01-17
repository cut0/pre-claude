import { useStdout } from 'ink';

/**
 * Hook to get terminal height and calculate available content height.
 *
 * CommonLayout fixed elements breakdown:
 * - padding top: 1 line
 * - Header: 3 lines (1 content + 2 border)
 * - ControlBar: 1 line
 * - StatusBar: 1 line
 * - padding bottom: 1 line
 * Total: 7 lines
 */
export const useTerminalHeight = () => {
  const { stdout } = useStdout();
  const rows = stdout?.rows ?? 24;

  const fixedLayoutHeight = 7;
  const availableHeight = Math.max(10, rows - fixedLayoutHeight);

  return { rows, availableHeight };
};
