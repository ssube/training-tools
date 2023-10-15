import { Box, Paper, Stack, Typography } from '@mui/material';
import React from 'react';
import { DragTag } from './DragTag.js';

export function TagPalette() {
  return <Paper>
    <Stack direction='column'>
      <DragTag label='a' value='a' />
      <DragTag label='b' value='b' />
      <DragTag label='c' value='c' />
    </Stack>
  </Paper>;
}
