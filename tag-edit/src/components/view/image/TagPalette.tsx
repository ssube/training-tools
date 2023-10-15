import { Box, Paper, Stack, Typography } from '@mui/material';
import React, { useContext } from 'react';
import { DragTag } from './DragTag.js';
import { useStore } from 'zustand';
import { mustExist } from '@apextoaster/js-utils';
import { StateContext } from '../../../state.js';

export function TagPalette() {
  const state = useContext(StateContext);
  const tags = useStore(mustExist(state), (s) => s.tags)

  const drags = tags.sort().map(it => <DragTag label={it} value={it} />);

  return <Paper>
    <Stack direction='column'>
      <Box>
        <Typography>Tags</Typography>
      </Box>
      {...drags}
    </Stack>
  </Paper>;
}
