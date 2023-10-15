import { mustExist } from '@apextoaster/js-utils';
import { Grid, Stack } from '@mui/material';
import React, { useContext } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { GridItemProps, GridListProps, Virtuoso, VirtuosoGrid } from 'react-virtuoso';
import { useStore } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
import { StateContext } from '../../../state.js';
import { ImageCard } from './ImageCard.js';
import { TagPalette } from './TagPalette.js';

export function ImageTab() {
  const state = useContext(StateContext);
  const images = useStore(mustExist(state), useShallow((s) => Object.keys(s.images)));

  function GridItem(props: GridItemProps) {
    // children and item are missing from GridItemProps
    const fullProps = props as GridItemProps & {
      children: React.ReactNode | Array<React.ReactNode>;
      style: any;
    };
    return <Grid item style={fullProps.style}>{fullProps.children}</Grid>;
  }

  function GridList(props: GridListProps) {
    return <Grid container spacing={2}>{props.children}</Grid>;
  }

  return <DndProvider backend={HTML5Backend}>
    <Stack direction='row'>
      <VirtuosoGrid
        style={{ height: 800, width: 1200 }}
        data={images}
        // overscan={10}
        itemContent={(index, image) => <ImageCard name={image} />}
        components={{
          Item: GridItem,
          List: GridList,
        }}
      />
      <TagPalette />
    </Stack>
  </DndProvider>;
}
