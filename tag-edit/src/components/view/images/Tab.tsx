import { mustExist } from '@apextoaster/js-utils';
import { Stack } from '@mui/material';
import React, { useContext } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { VirtuosoGrid } from 'react-virtuoso';
import { useStore } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
import styled from '@emotion/styled';

import { StateContext } from '../../../state.js';
import { ImageCard } from './ImageCard.js';
import { TagPalette } from './TagPalette.js';

const ItemContainer = styled.div`
  padding: 0.5rem;
  width: 33%;
  display: flex;
  flex: none;
  align-content: stretch;
  box-sizing: border-box;

  @media (max-width: 1024px) {
    width: 50%;
  }

  @media (max-width: 300px) {
    width: 100%;
  }
`;

const ItemWrapper = styled.div`
  flex: 1;
  text-align: center;
  font-size: 80%;
  padding: 1rem 1rem;
  border: 1px solid var(gray);
  white-space: nowrap;
`;

const ListContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
`;

export function ImagesTab() {
  const state = useContext(StateContext);
  const images = useStore(mustExist(state), useShallow((s) => Object.keys(s.images)));

  return <DndProvider backend={HTML5Backend}>
    <Stack direction='row'>
      <VirtuosoGrid
        style={{ height: 1000, width: 1800 }}
        data={images}
        components={{
          Item: ItemContainer,
          List: ListContainer as any,
        }}
        itemContent={(_index, image) => <ItemWrapper><ImageCard name={image} /></ItemWrapper>}
      />
      <TagPalette />
    </Stack>
  </DndProvider>;
}
