import { mustExist } from '@apextoaster/js-utils';
import { createLogger, Logger } from 'browser-bunyan';
import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { I18nextProvider, initReactI18next } from 'react-i18next';
import { createStore } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { App } from './components/App.js';
import {
  AppState,
  createStateSlices,
  LoggerContext,
  STATE_KEY,
  STATE_VERSION,
  StateContext,
} from './state.js';
import { I18N_STRINGS } from './strings/all.js';

export const INITIAL_LOAD_TIMEOUT = 5_000;

export async function renderApp(logger: Logger) {
  // prep zustand with a slice for each tab, using local storage
  const { appSlice } = createStateSlices();

  const state = createStore<AppState, [['zustand/persist', AppState]]>(persist((...slice) => ({
    ...appSlice(...slice),
  }), {
    name: STATE_KEY,
    storage: createJSONStorage(() => localStorage),
    partialize(state) {
      return {
        ...state,
        images: {},
      };
    },
    version: STATE_VERSION,
  }));

  const reactLogger = logger.child({
    system: 'react',
  });

  // go
  return <LoggerContext.Provider value={reactLogger}>
    <I18nextProvider i18n={i18n}>
      <StateContext.Provider value={state}>
        <App />
      </StateContext.Provider>
    </I18nextProvider>
  </LoggerContext.Provider>;
}

export async function main() {
  const debug = true; // isDebug();
  const logger = createLogger({
    name: 'tag-edit',
    level: debug ? 'debug' : 'info',
  });

  // TODO: get filesystem permissions

  // prep react-dom
  const appElement = mustExist(document.getElementById('app'));
  const app = createRoot(appElement);

  // prep i18next
  await i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      debug: true,
      fallbackLng: 'en',
      interpolation: {
        escapeValue: false, // not needed for react as it escapes by default
      },
      resources: I18N_STRINGS,
      returnEmptyString: false,
    });

  app.render(await renderApp(logger));
}

window.addEventListener('load', () => {
  // eslint-disable-next-line no-console
  console.log('launching onnx-web');
  main().catch((err) => {
    // eslint-disable-next-line no-console
    console.error('error in main', err);
  });
}, false);
