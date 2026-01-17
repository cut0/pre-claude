import { useInput } from 'ink';

export type ControlOptions = {
  onUp?: () => void;
  onDown?: () => void;
  onLeft?: () => void;
  onRight?: () => void;
  onEnter?: () => void;
  onEscape?: () => void;
  onQuit?: () => void;
  onGenerate?: () => void;
  onSave?: () => void;
  onDelete?: () => void;
  onNext?: () => void;
  onPrev?: () => void;
  onRegenerate?: () => void;
  onInfo?: () => void;
  onChar?: (char: string) => void;
  isActive?: boolean;
  viKeysEnabled?: boolean;
};

export const useControl = (options: ControlOptions = {}): void => {
  const {
    onUp,
    onDown,
    onLeft,
    onRight,
    onEnter,
    onEscape,
    onQuit,
    onGenerate,
    onSave,
    onDelete,
    onNext,
    onPrev,
    onRegenerate,
    onInfo,
    onChar,
    isActive = true,
    viKeysEnabled = true,
  } = options;

  useInput(
    (input, key) => {
      if (key.upArrow) {
        onUp?.();
        return;
      }
      if (key.downArrow) {
        onDown?.();
        return;
      }
      if (key.leftArrow) {
        onLeft?.();
        return;
      }
      if (key.rightArrow) {
        onRight?.();
        return;
      }

      if (key.return) {
        onEnter?.();
        return;
      }
      if (key.escape) {
        onEscape?.();
        return;
      }

      if (viKeysEnabled) {
        switch (input) {
          case 'k':
            onUp?.();
            return;
          case 'j':
            onDown?.();
            return;
          case 'h':
            onLeft?.();
            return;
          case 'l':
            onRight?.();
            return;
        }
      }

      switch (input) {
        case 'q':
          onQuit?.();
          return;
        case 'g':
          onGenerate?.();
          return;
        case 's':
          onSave?.();
          return;
        case 'd':
          onDelete?.();
          return;
        case 'n':
          onNext?.();
          return;
        case 'p':
          onPrev?.();
          return;
        case 'r':
          onRegenerate?.();
          return;
        case 'i':
          onInfo?.();
          return;
      }

      onChar?.(input);
    },
    { isActive },
  );
};
