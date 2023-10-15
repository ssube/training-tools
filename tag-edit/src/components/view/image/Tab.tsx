import { mustExist } from '@apextoaster/js-utils';
import { Grid, Stack } from '@mui/material';
import React, { useContext } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useStore } from 'zustand';
import { StateContext } from '../../../state.js';
import { ImageCard } from './ImageCard.js';
import { TagPalette } from './TagPalette.js';

export function ImageTab() {
  const state = useContext(StateContext);
  const images = useStore(mustExist(state), (s) => s.images);

  /* for each image in the directory, show a card */
  const cards = Object.entries(images).map(([name, value]) => <Grid item><ImageCard name={name} tags={value.captions} image={value.image} /></Grid>);

  return <DndProvider backend={HTML5Backend}>
    <Stack direction='row'>
      <Grid container spacing={2}>{...cards}</Grid>
      <TagPalette />
    </Stack>
  </DndProvider>;
}
