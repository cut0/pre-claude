import type { FormField, RepeatableLayout } from '../../../types';

export type FormValues = Record<string, Record<string, unknown>>;

export const ACCENT_COLOR = 'green';
export const HELP_COLOR = 'blue';

export type FocusPanel = 'steps' | 'list' | 'form';

export type FlatFieldItem =
  | {
      type: 'field';
      field: FormField;
      path: string;
      label: string;
      treePrefix?: string;
    }
  | {
      type: 'repeatable-add';
      repeatable: RepeatableLayout;
      path: string;
      label: string;
      treePrefix?: string;
    }
  | {
      type: 'repeatable-header';
      repeatable: RepeatableLayout;
      path: string;
      index: number;
      label: string;
      treePrefix?: string;
    };
