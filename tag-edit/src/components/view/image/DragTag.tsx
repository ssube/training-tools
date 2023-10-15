import { Box, Button, IconButton } from '@mui/material';
import React from 'react';
import { useDrag } from 'react-dnd';
import { DRAG_TYPES } from '../../drag.js';
import { Delete } from '@mui/icons-material';
import { doesExist } from '@apextoaster/js-utils';

export interface DragTagProps {
  label: string;
  value: string;

  onDelete?: (tag: DragTagProps) => void;
}

export function DragTag(props: DragTagProps) {
  const [, drag] = useDrag(() => ({
    item: props,
    type: DRAG_TYPES.Tag,
  }));

  return <Box>
    <Button ref={drag}>{props.label}</Button>
    {doesExist(props.onDelete) &&
    <IconButton aria-label='delete' size='small' onClick={() => {
      if (doesExist(props.onDelete)) {
          props.onDelete(props);
      }}}>
      <Delete fontSize='inherit' />
    </IconButton>}
  </Box>;
}
