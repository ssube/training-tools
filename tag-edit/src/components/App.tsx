import { doesExist, mustExist } from '@apextoaster/js-utils';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { Box, Button, Tab } from '@mui/material';
import React, { useContext, useState } from 'react';
import { useStore } from 'zustand';

import { Images, StateContext, Tags } from '../state.js';
import { ImagesTab } from './view/images/Tab.js';
import { StatsTab } from './view/stats/Tab.js';

export function App() {
  const state = useContext(StateContext);
  const dirty = useStore(mustExist(state), (s) => s.dirty)
  const loadImages = useStore(mustExist(state), (s) => s.loadImages);
  const setDirty = useStore(mustExist(state), (s) => s.setDirty);
  const setTags = useStore(mustExist(state), (s) => s.setTags);

  const [tab, setTab] = useState('image');

  async function load() {
    const { images, tags } = await openDirectory();
    loadImages(images);

    const allTags = gatherTags(images, tags);
    setTags(allTags);
  }

  return <Box sx={{ width: '100%' }}>
    <TabContext value={tab}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <TabList onChange={(_e, key) => setTab(key)}>
          <Tab value='image' label='Caption Editor' />
          <Tab value='all' label='Tag Stats' />
          <Button onClick={load}>Open</Button>
          {dirty && <Button onClick={() => setDirty(false)}>Save</Button>}
        </TabList>
      </Box>
      <TabPanel value='image'>
        <ImagesTab />
      </TabPanel>
      <TabPanel value='all'>
        <StatsTab />
      </TabPanel>
    </TabContext>
  </Box>;
}

export async function openDirectory(): Promise<{ images: Images, tags: Array<string> }> {
  const handle = await window.showDirectoryPicker();
  console.log('loading from', handle.name);

  const images: Record<string, File> = {};
  const captions: Record<string, Array<string>> = {};
  const tags: Array<string> = [];

  for await (const [key, value] of handle.entries()) {
    console.log({ key, value, handle });

    if (value.kind === 'file') {
      const [name, ext] = value.name.split('.');

      if (isImage(ext)) {
        images[name] = await value.getFile();
        continue;
      }

      if (value.name === 'tags.txt') {
        const file = await value.getFile();
        const data = await readCaption(file);
        tags.push(...data);
        continue;
      }

      if (isCaption(ext)) {
        const file = await value.getFile();
        captions[name] = await readCaption(file);
        continue;
      }
    }
  }

  console.log(captions, images);

  const results: Images = {};

  for (const [name, image] of Object.entries(images)) {
    const tags = captions[name];
    if (doesExist(tags)) {
      results[name] = {
        captions: tags,
        image,
      };
    }
  }

  return {
    images: results,
    tags,
  };
}

export function isImage(name: string): boolean {
  return ['jpg', 'jpeg', 'png'].includes(name);
}

export function isCaption(name: string): boolean {
  return ['caption', 'txt'].includes(name);
}

export function gatherTags(images: Images, preknown: Array<string>): Tags {
  const banned = new Set<string>();
  const known = new Set<string>();

  for (const tag of preknown) {
    if (tag.startsWith('*') && tag.length > 1) {
      banned.add(tag.substring(1));
      continue;
    }

    if (tag.length > 0) {
      known.add(tag);
      continue;
    }
  }

  for (const [_name, value] of Object.entries(images)) {
    for (const tag of value.captions) {
      if (tag.startsWith('*') && tag.length > 1) {
        banned.add(tag.substring(1));
        continue;
      }

      if (tag.length > 0) {
        known.add(tag);
        continue;
      }
    }
  }

  return {
    banned: Array.from(banned),
    known: Array.from(known),
  };
}

export async function readCaption(file: File): Promise<Array<string>> {
  const text = await file.text();
  return text.split('\n').flatMap(line => line.split(',')).map(it => it.trim());
}
