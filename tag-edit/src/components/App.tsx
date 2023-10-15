import { doesExist, mustExist } from '@apextoaster/js-utils';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { Box, Button, Tab } from '@mui/material';
import React, { useContext, useState } from 'react';
import { useStore } from 'zustand';
import { Images, StateContext } from '../state';
import { AllTab } from './view/all/Tab';
import { ImageTab } from './view/image/Tab';

export function App() {
  const state = useContext(StateContext);
  const dirty = useStore(mustExist(state), (s) => s.dirty)
  const loadImages = useStore(mustExist(state), (s) => s.loadImages);
  const setDirty = useStore(mustExist(state), (s) => s.setDirty);
  const setTags = useStore(mustExist(state), (s) => s.setTags);

  const [tab, setTab] = useState('image');

  async function load() {
    const images = await openDirectory();
    loadImages(images);

    const tags = gatherTags(images);
    setTags(tags);
  }

  return <Box sx={{ width: '100%' }}>
    <TabContext value={tab}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <TabList onChange={(_e, key) => setTab(key)}>
          <Tab value='image' label='Image Tags' />
          <Tab value='all' label='All Tags' />
          <Button onClick={load}>Open</Button>
          {dirty && <Button onClick={() => setDirty(false)}>Save</Button>}
        </TabList>
      </Box>
      <TabPanel value='image'>
        <ImageTab />
      </TabPanel>
      <TabPanel value='all'>
        <AllTab />
      </TabPanel>
    </TabContext>
  </Box>;
}

export async function openDirectory(): Promise<Images> {
  const handle = await window.showDirectoryPicker();
  console.log('loading from', handle.name);

  const images: Record<string, File> = {};
  const captions: Record<string, Array<string>> = {};

  for await (const [key, value] of handle.entries()) {
    console.log({ key, value, handle });

    if (value.kind === 'file') {
      const [name, ext] = value.name.split('.');
      if (isImage(ext)) {
        images[name] = await value.getFile();
      }

      if (isCaption(ext)) {
        const file = await value.getFile();
        const text = await file.text();
        captions[name] = text.split(',').map(it => it.trim());
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

  return results;
}

export function isImage(name: string): boolean {
  return ['jpg', 'jpeg', 'png'].includes(name);
}

export function isCaption(name: string): boolean {
  return ['caption', 'txt'].includes(name);
}

export function gatherTags(images: Images): Array<string> {
  const tags = new Set<string>();

  for (const [name, value] of Object.entries(images)) {
    for (const tag of value.captions) {
      tags.add(tag);
    }
  }

  return Array.from(tags);
}
