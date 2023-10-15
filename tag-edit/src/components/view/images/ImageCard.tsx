import { Maybe, doesExist, mustExist } from '@apextoaster/js-utils';
import { Box, Button, Card, CardActions, CardContent, CardMedia, Typography } from '@mui/material';
import React, { useContext, useMemo } from 'react';
import { useDrop } from 'react-dnd';
import { useStore } from 'zustand';

import { ImageCaption, StateContext } from '../../../state.js';
import { DRAG_TYPES } from '../../drag.js';
import { DragTag, DragTagProps } from './DragTag.js';

export interface ImageCardProps {
  name: string;
}

export function ImageCard(props: ImageCardProps) {
  const state = useContext(StateContext);
  const banned = useStore(mustExist(state), (s) => s.tags.banned);
  const image: Maybe<ImageCaption> = useStore(mustExist(state), (s) => s.images[props.name]);

  const setCaptions = useStore(mustExist(state), (s) => s.setCaptions);

  function addTag(tag: DragTagProps) {
    console.log('adding dropped tag', tag);
    if (doesExist(image)) {
      setCaptions(props.name, dedupe([
        ...image.captions,
        tag.value,
      ]));
    }
  }

  function removeTag(tag: DragTagProps) {
    console.log('remove dropped tag', tag);
    if (doesExist(image)) {
      setCaptions(props.name, image.captions.filter(it => it !== tag.value));
    }
  }

  const [, drop] = useDrop(
    () => ({
      accept: DRAG_TYPES.Tag,
      drop: addTag,
    }),
    [image?.captions],
  );

  const url = useMemo(() => URL.createObjectURL(image?.image || new Blob()), [image?.image?.name]);

  const tags = image?.captions.map(tag => <DragTag banned={banned.includes(tag)} label={tag} value={tag} onDelete={removeTag} />) || [];

  return <Card ref={drop} sx={{ maxWidth: 500 }}>
    <CardMedia
      sx={{ height: 250 }}
      image={url}
      title={props.name}
    />
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
      <Button size='small' disabled>Crop</Button>
      <Button size='small' disabled>Delete</Button>
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