import { doesExist, mustExist } from '@apextoaster/js-utils';
import { Box, Button, Card, CardActions, CardContent, CardMedia, Typography } from '@mui/material';
import React, { useContext, useMemo } from 'react';
import { useDrop } from 'react-dnd';
import { useStore } from 'zustand';

import { StateContext } from '../../../state.js';
import { DRAG_TYPES } from '../../drag.js';
import { DragTag, DragTagProps } from './DragTag.js';

export interface ImageCardProps {
  name: string;
}

export function ImageCard(props: ImageCardProps) {
  const state = useContext(StateContext);
  const image = useStore(mustExist(state), (s) => s.images[props.name]);

  const setCaptions = useStore(mustExist(state), (s) => s.setCaptions);

  function addTag(tag: DragTagProps) {
    console.log('adding dropped tag', tag);
    setCaptions(props.name, dedupe([
      ...image.captions,
      tag.value,
    ]));
  }

  function removeTag(tag: DragTagProps) {
    console.log('remove dropped tag', tag);
    setCaptions(props.name, image.captions.filter(it => it !== tag.value));
  }

  const [, drop] = useDrop(
    () => ({
      accept: DRAG_TYPES.Tag,
      drop: addTag,
    }),
    [image.captions],
  );

  const url = useMemo(() => URL.createObjectURL(mustExist(image.image)), [mustExist(image.image).name]);

  const tags = image.captions.map(tag => <DragTag label={tag} value={tag} onDelete={removeTag} />);

  return <Card ref={drop} sx={{ maxWidth: 345 }}>
    {doesExist(image.image) && <CardMedia
      sx={{ height: 140 }}
      image={url}
      title={props.name}
    />}
    <CardContent>
      <Box>
        <Typography gutterBottom variant='h5' component='div'>
          {props.name}
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
        {...tags}
      </Box>
    </CardContent>
    <CardActions>
      <Button size='small'>Crop</Button>
      <Button size='small'>Delete</Button>
    </CardActions>
  </Card>;
}

export function dedupe(tags: Array<string>): Array<string> {
  const previous = new Set();

  return tags.filter(it => {
    const seen = previous.has(it);
    previous.add(it);
    return !seen;
  });
}