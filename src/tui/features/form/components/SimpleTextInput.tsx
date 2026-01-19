import { Box, Text, useInput } from 'ink';
import { type FC, useEffect, useMemo, useState } from 'react';

import { ACCENT_COLOR } from '../types';

type SimpleTextInputProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  placeholder?: string;
  multiline?: boolean;
  suggestions?: string[];
  onOpenExternalEditor?: () => void;
};

const MAX_VISIBLE_SUGGESTIONS = 5;

export const SimpleTextInput: FC<SimpleTextInputProps> = ({
  value,
  onChange,
  onSubmit,
  onCancel,
  placeholder = '',
  multiline = false,
  suggestions = [],
  onOpenExternalEditor,
}) => {
  const [cursorPosition, setCursorPosition] = useState(value.length);
  const [suggestionIndex, setSuggestionIndex] = useState(-1);
  const [scrollOffset, setScrollOffset] = useState(0);

  const filteredSuggestions =
    !multiline && suggestions.length > 0
      ? suggestions.filter(
          (s) =>
            s.toLowerCase().includes(value.toLowerCase()) &&
            s.toLowerCase() !== value.toLowerCase(),
        )
      : [];

  const hasSuggestions = filteredSuggestions.length > 0;

  // Reset suggestion index and scroll when filtered suggestions change
  useEffect(() => {
    if (filteredSuggestions.length === 0) {
      setSuggestionIndex(-1);
      setScrollOffset(0);
    } else if (suggestionIndex >= filteredSuggestions.length) {
      setSuggestionIndex(filteredSuggestions.length - 1);
    }
  }, [filteredSuggestions.length, suggestionIndex]);

  // Adjust scroll offset to keep selected item visible
  useEffect(() => {
    if (suggestionIndex < 0) return;

    if (suggestionIndex < scrollOffset) {
      setScrollOffset(suggestionIndex);
    } else if (suggestionIndex >= scrollOffset + MAX_VISIBLE_SUGGESTIONS) {
      setScrollOffset(suggestionIndex - MAX_VISIBLE_SUGGESTIONS + 1);
    }
  }, [suggestionIndex, scrollOffset]);

  // Calculate visible suggestions based on scroll offset
  const visibleSuggestions = useMemo(() => {
    return filteredSuggestions.slice(
      scrollOffset,
      scrollOffset + MAX_VISIBLE_SUGGESTIONS,
    );
  }, [filteredSuggestions, scrollOffset]);

  const acceptSuggestion = (index: number) => {
    const suggestion = filteredSuggestions[index];
    if (suggestion) {
      onChange(suggestion);
      setCursorPosition(suggestion.length);
      setSuggestionIndex(-1);
    }
  };

  useInput((input, key) => {
    if (key.escape) {
      if (suggestionIndex >= 0) {
        setSuggestionIndex(-1);
        return;
      }
      onCancel();
      return;
    }

    // Ctrl+G: open external editor (textarea only)
    if (multiline && key.ctrl && input === 'g') {
      onOpenExternalEditor?.();
      return;
    }

    // Up/Down arrow for suggestion navigation (single-line mode with suggestions)
    if (!multiline && hasSuggestions) {
      if (key.upArrow) {
        setSuggestionIndex((prev) =>
          prev <= 0 ? filteredSuggestions.length - 1 : prev - 1,
        );
        return;
      }
      if (key.downArrow) {
        setSuggestionIndex((prev) =>
          prev >= filteredSuggestions.length - 1 ? 0 : prev + 1,
        );
        return;
      }
    }

    // Tab accepts current suggestion or moves to next
    if (key.tab) {
      if (multiline) {
        onSubmit();
        return;
      }
      if (hasSuggestions) {
        if (suggestionIndex >= 0) {
          // Accept current selection
          acceptSuggestion(suggestionIndex);
        } else {
          // Select first suggestion
          setSuggestionIndex(0);
        }
        return;
      }
      onSubmit();
      return;
    }

    if (key.return) {
      if (multiline) {
        if (key.ctrl) {
          onSubmit();
          return;
        }
        const newValue = `${value.slice(0, cursorPosition)}\n${value.slice(cursorPosition)}`;
        onChange(newValue);
        setCursorPosition(cursorPosition + 1);
        return;
      }
      // Accept selected suggestion on Enter
      if (suggestionIndex >= 0 && filteredSuggestions[suggestionIndex]) {
        acceptSuggestion(suggestionIndex);
        return;
      }
      setSuggestionIndex(-1);
      onSubmit();
      return;
    }

    if (key.backspace || key.delete) {
      if (cursorPosition > 0) {
        const newValue =
          value.slice(0, cursorPosition - 1) + value.slice(cursorPosition);
        onChange(newValue);
        setCursorPosition(cursorPosition - 1);
        setSuggestionIndex(-1);
      }
      return;
    }

    if (key.leftArrow) {
      setCursorPosition(Math.max(0, cursorPosition - 1));
      return;
    }

    if (key.rightArrow) {
      setCursorPosition(Math.min(value.length, cursorPosition + 1));
      return;
    }

    if (multiline && key.upArrow) {
      const lines = value.slice(0, cursorPosition).split('\n');
      if (lines.length > 1) {
        const currentLineLength = lines[lines.length - 1]?.length ?? 0;
        const prevLineLength = lines[lines.length - 2]?.length ?? 0;
        const newColPosition = Math.min(currentLineLength, prevLineLength);
        const newPosition =
          cursorPosition -
          currentLineLength -
          1 -
          prevLineLength +
          newColPosition;
        setCursorPosition(Math.max(0, newPosition));
      }
      return;
    }

    if (multiline && key.downArrow) {
      const beforeCursor = value.slice(0, cursorPosition);
      const afterCursor = value.slice(cursorPosition);
      const linesBeforeCursor = beforeCursor.split('\n');
      const currentLineLength =
        linesBeforeCursor[linesBeforeCursor.length - 1]?.length ?? 0;
      const linesAfterCursor = afterCursor.split('\n');
      if (linesAfterCursor.length > 1) {
        const restOfCurrentLine = linesAfterCursor[0]?.length ?? 0;
        const nextLineLength = linesAfterCursor[1]?.length ?? 0;
        const newColPosition = Math.min(currentLineLength, nextLineLength);
        const newPosition =
          cursorPosition + restOfCurrentLine + 1 + newColPosition;
        setCursorPosition(Math.min(value.length, newPosition));
      }
      return;
    }

    if (input && !key.ctrl && !key.meta) {
      const newValue =
        value.slice(0, cursorPosition) + input + value.slice(cursorPosition);
      onChange(newValue);
      setCursorPosition(cursorPosition + input.length);
      setSuggestionIndex(-1);
    }
  });

  const displayValue = value || placeholder;
  const isPlaceholder = !value && placeholder;

  if (multiline) {
    const lines = displayValue.split('\n');
    let charCount = 0;

    return (
      <Box flexDirection="column">
        {lines.map((line, lineIndex) => {
          const lineStart = charCount;
          const lineEnd = charCount + line.length;
          charCount = lineEnd + 1;

          const cursorInLine =
            cursorPosition >= lineStart && cursorPosition <= lineEnd;
          const cursorCol = cursorPosition - lineStart;

          if (cursorInLine) {
            return (
              <Box key={lineIndex}>
                <Text color={isPlaceholder ? 'gray' : 'white'}>
                  {line.slice(0, cursorCol)}
                </Text>
                <Text backgroundColor="white" color="black">
                  {line[cursorCol] || ' '}
                </Text>
                <Text color={isPlaceholder ? 'gray' : 'white'}>
                  {line.slice(cursorCol + 1)}
                </Text>
              </Box>
            );
          }

          return (
            <Text key={lineIndex} color={isPlaceholder ? 'gray' : 'white'}>
              {line || ' '}
            </Text>
          );
        })}
      </Box>
    );
  }

  // Highlight matching part in suggestion
  const highlightMatch = (suggestion: string, query: string) => {
    if (!query) return suggestion;
    const lowerSuggestion = suggestion.toLowerCase();
    const lowerQuery = query.toLowerCase();
    const matchIndex = lowerSuggestion.indexOf(lowerQuery);
    if (matchIndex === -1) return suggestion;

    const before = suggestion.slice(0, matchIndex);
    const match = suggestion.slice(matchIndex, matchIndex + query.length);
    const after = suggestion.slice(matchIndex + query.length);

    return { before, match, after };
  };

  return (
    <Box flexDirection="column">
      <Box>
        <Text color={isPlaceholder ? 'gray' : 'white'}>
          {displayValue.slice(0, cursorPosition)}
        </Text>
        <Text backgroundColor="white" color="black">
          {displayValue[cursorPosition] || ' '}
        </Text>
        <Text color={isPlaceholder ? 'gray' : 'white'}>
          {displayValue.slice(cursorPosition + 1)}
        </Text>
      </Box>
      {hasSuggestions && (
        <Box flexDirection="column" marginTop={1}>
          <Text dimColor>↑↓: select Tab/Enter: accept</Text>
          <Box
            flexDirection="column"
            borderStyle="round"
            borderColor="gray"
            paddingX={1}
          >
            {visibleSuggestions.map((suggestion, visibleIndex) => {
              const actualIndex = scrollOffset + visibleIndex;
              const isSelected = actualIndex === suggestionIndex;
              const parts = highlightMatch(suggestion, value);

              if (typeof parts === 'string') {
                return (
                  <Box key={suggestion}>
                    <Text
                      color={isSelected ? 'black' : undefined}
                      backgroundColor={isSelected ? ACCENT_COLOR : undefined}
                    >
                      {isSelected ? '> ' : '  '}
                      {parts}
                    </Text>
                  </Box>
                );
              }

              return (
                <Box key={suggestion}>
                  <Text
                    color={isSelected ? 'black' : undefined}
                    backgroundColor={isSelected ? ACCENT_COLOR : undefined}
                  >
                    {isSelected ? '> ' : '  '}
                  </Text>
                  <Text
                    color={isSelected ? 'black' : 'gray'}
                    backgroundColor={isSelected ? ACCENT_COLOR : undefined}
                  >
                    {parts.before}
                  </Text>
                  <Text
                    color={isSelected ? 'black' : 'yellow'}
                    backgroundColor={isSelected ? ACCENT_COLOR : undefined}
                    bold={!isSelected}
                  >
                    {parts.match}
                  </Text>
                  <Text
                    color={isSelected ? 'black' : 'gray'}
                    backgroundColor={isSelected ? ACCENT_COLOR : undefined}
                  >
                    {parts.after}
                  </Text>
                </Box>
              );
            })}
          </Box>
        </Box>
      )}
    </Box>
  );
};
