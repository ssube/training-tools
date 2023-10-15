import { doesExist } from '@apextoaster/js-utils';
import { Chip } from '@mui/material';
import React from 'react';
import { useDrag } from 'react-dnd';

import { DRAG_TYPES } from '../../drag.js';

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

  function handleDelete() {
    if (doesExist(props.onDelete)) {
        props.onDelete(props);
    }
  }

  if (doesExist(props.onDelete)) {
    return <Chip ref={drag} label={props.label} onDelete={handleDelete} />;
  } else {
    return <Chip ref={drag} label={props.label} />;
  }
}
