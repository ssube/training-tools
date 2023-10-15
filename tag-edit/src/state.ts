import { Maybe } from '@apextoaster/js-utils';
import { Logger } from 'noicejs';
import { createContext } from 'react';
import { StoreApi, StateCreator } from 'zustand';

/**
 * Shorthand for state creator to reduce repeated arguments.
 */
export type Slice<T> = StateCreator<AppState, [], [], T>;

export interface AppState {
  root: string;
  captions: {
    [key: string]: Array<string>;
  };

  setCaptions(name: string, tags: Array<string>): void;
}

export function createStateSlices() {
  const appSlice: Slice<AppState> = (set) => ({
    root: '',
    captions: {
      foo: ['foo', 'bar'],
      bar: ['bar', 'baz'],
    },
    setCaptions(name, tags) {
      set((prev) => {
        return {
          ...prev,
          captions: {
            ...prev.captions,
            [name]: tags,
          },
        };
      });
    },
  });

  return {
    appSlice,
  };
}

/**
 * React context binding for bunyan logger.
 */
export const LoggerContext = createContext<Maybe<Logger>>(undefined);

/**
 * React context binding for zustand state store.
 */
export const StateContext = createContext<Maybe<StoreApi<AppState>>>(undefined);

/**
 * Key for zustand persistence, typically local storage.
 */
export const STATE_KEY = 'tag-edit';

/**
 * Current state version for zustand persistence.
 */
export const STATE_VERSION = 1;
