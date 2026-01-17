import { useEffect, useRef } from 'react';

type MountFunction = () => void | Promise<void>;

type StrictVoidFunction<T extends MountFunction> =
  ReturnType<T> extends void | Promise<void> ? T : never;

export const useMount = <T extends MountFunction>(
  fn: StrictVoidFunction<T>,
) => {
  const mountedRef = useRef(false);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (mountedRef.current) {
      return;
    }
    fn();
    mountedRef.current = true;
  }, []);
};
