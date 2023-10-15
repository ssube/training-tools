import { mustExist } from '@apextoaster/js-utils';
import { Box, Paper, Stack, Typography } from '@mui/material';
import React, { useContext } from 'react';
import { useStore } from 'zustand';

import { StateContext } from '../../../state.js';
import { DragTag } from './DragTag.js';
import { Virtuoso } from 'react-virtuoso';
import { useShallow } from 'zustand/react/shallow';

export function TagPalette() {
  const state = useContext(StateContext);
  const tags = useStore(mustExist(state), useShallow((s) => s.tags.sort()));

  return <Paper>
    <Stack direction='column'>
      <Box>
        <Typography>Tags</Typography>
      </Box>
      <Virtuoso
        style={{ height: 1000, width: 300 }}
        data={tags}
        itemContent={(_index, tag) => <DragTag label={tag} value={tag} />}
      />
    </Stack>
  </Paper>;
}
