import { Text, useApp } from 'ink';
import { type FC, useCallback, useState } from 'react';

import type { AiContext, Config, Scenario } from '../types';
import type { DocumentWithMetadata } from './features/document/types';
import type { FormValues } from './features/form/types';
import { Preview } from './views/Preview';
import { ScenarioForm } from './views/ScenarioForm';
import { SelectScenario } from './views/SelectScenario';

type AppProps = {
  config: Config;
  initialScenarioId?: string;
};

type PreviewData = {
  formValues: FormValues;
  aiContext: AiContext;
  initialContent?: string;
  editingFilename?: string;
};

type AppState =
  | { screen: 'select' }
  | {
      screen: 'form';
      scenarioId: string;
      initialFormValues?: FormValues;
      editingFilename?: string;
    }
  | { screen: 'preview'; scenarioId: string; previewData: PreviewData };

export const App: FC<AppProps> = ({ config, initialScenarioId }) => {
  const { exit } = useApp();

  const [appState, setAppState] = useState<AppState>(() => {
    if (initialScenarioId != null) {
      const scenario = config.scenarios.find((s) => s.id === initialScenarioId);
      if (scenario != null) {
        return { screen: 'form', scenarioId: initialScenarioId };
      }
    }
    return { screen: 'select' };
  });

  const getScenario = useCallback(
    (scenarioId: string): Scenario | undefined => {
      return config.scenarios.find((s) => s.id === scenarioId);
    },
    [config.scenarios],
  );

  const handleSelectNew = useCallback((scenarioId: string) => {
    setAppState({ screen: 'form', scenarioId });
  }, []);

  const handleSelectDocument = useCallback(
    (scenarioId: string, doc: DocumentWithMetadata) => {
      setAppState({
        screen: 'form',
        scenarioId,
        initialFormValues: (doc.metadata?.formData ?? {}) as FormValues,
        editingFilename: doc.filename,
      });
    },
    [],
  );

  const handleBackToSelect = useCallback(() => {
    setAppState({ screen: 'select' });
  }, []);

  const handleGeneratePreview = useCallback(
    (formValues: FormValues, aiContext: AiContext) => {
      if (appState.screen !== 'form') return;
      setAppState({
        screen: 'preview',
        scenarioId: appState.scenarioId,
        previewData: {
          formValues,
          aiContext,
          editingFilename: appState.editingFilename,
        },
      });
    },
    [appState],
  );

  const handleBackToForm = useCallback(() => {
    if (appState.screen !== 'preview') return;
    setAppState({
      screen: 'form',
      scenarioId: appState.scenarioId,
      initialFormValues: appState.previewData.formValues,
      editingFilename: appState.previewData.editingFilename,
    });
  }, [appState]);

  if (appState.screen === 'select') {
    return (
      <SelectScenario
        scenarios={config.scenarios}
        onSelectNew={handleSelectNew}
        onSelectDocument={handleSelectDocument}
        onExit={() => exit()}
      />
    );
  }

  const scenario = getScenario(appState.scenarioId);
  if (scenario == null) {
    return <Text color="red">Error: Scenario not found</Text>;
  }

  if (appState.screen === 'form') {
    return (
      <ScenarioForm
        key={appState.scenarioId}
        scenario={scenario}
        initialFormValues={appState.initialFormValues}
        onGeneratePreview={handleGeneratePreview}
        onBack={handleBackToSelect}
      />
    );
  }

  if (appState.screen === 'preview') {
    return (
      <Preview
        config={config}
        scenario={scenario}
        formValues={appState.previewData.formValues}
        aiContext={appState.previewData.aiContext}
        initialContent={appState.previewData.initialContent}
        editingFilename={appState.previewData.editingFilename}
        onBack={handleBackToForm}
      />
    );
  }

  return <Text color="red">Unknown screen</Text>;
};
