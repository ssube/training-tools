import { Maybe } from '@apextoaster/js-utils';
import { Logger } from 'noicejs';
import { createContext } from 'react';
import { StoreApi, StateCreator } from 'zustand';

/**
 * Shorthand for state creator to reduce repeated arguments.
 */
export type Slice<T> = StateCreator<AppState, [], [], T>;

export interface Images {
  [key: string]: {
    captions: Array<string>;
    image?: File;
  };
}

export interface AppState {
  dirty: boolean;
  images: Images;
  tags: Array<string>;

  loadImages(images: Images): void;

  setCaptions(name: string, tags: Array<string>): void;
  setDirty(dirty?: boolean): void;
  setTags(tags: Array<string>): void;
}

export function createStateSlices() {
  const appSlice: Slice<AppState> = (set) => ({
    dirty: false,
    images: {},
    tags: [],
    loadImages(images) {
      set((prev) => ({
        ...prev,
        images,
      }));
    },
    setCaptions(name, captions) {
      set((prev) => {
        const image = prev.images[name].image;
        return {
          ...prev,
          images: {
            ...prev.images,
            [name]: {
              captions,
              image,
            },
          },
          dirty: true,
        };
      });
    },
    setDirty(dirty = true) {
      set((prev) => ({
        ...prev,
        dirty,
      }));
    },
    setTags(tags) {
      set((prev) => ({
        ...prev,
        tags,
      }));
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
