import { Box, Button, Card, CardActions, CardContent, CardMedia, Typography } from '@mui/material';
import React, { useContext } from 'react';
import { DragTag, DragTagProps } from './DragTag';
import { DRAG_TYPES } from '../../drag';
import { useDrop } from 'react-dnd';
import { useStore } from 'zustand';
import { mustExist } from '@apextoaster/js-utils';
import { StateContext } from '../../../state.js';

export interface ImageCardProps {
  name: string;
  tags: Array<string>;
}

export function ImageCard(props: ImageCardProps) {
  const imageFile = `file://${props.name}`;

  const state = useContext(StateContext);
  const setCaptions = useStore(mustExist(state), (s) => s.setCaptions);

  function addTag(tag: DragTagProps) {
    console.log('adding dropped tag', tag);
    setCaptions(props.name, dedupe([
      ...props.tags,
      tag.value,
    ]));
  }

  function removeTag(tag: DragTagProps) {
    console.log('remove dropped tag', tag);
    setCaptions(props.name, props.tags.filter(it => it !== tag.value));
  }

  const [, drop] = useDrop(
    () => ({
      accept: DRAG_TYPES.Tag,
      drop: addTag,
    }),
    [props.tags],
  );

  const tags = props.tags.map(tag => <DragTag label={tag} value={tag} onDelete={removeTag} />);

  return <Card sx={{ maxWidth: 345 }}>
    <CardMedia
      sx={{ height: 140 }}
      image={imageFile}
      title={props.name}
    />
    <CardContent>
      <Box>
        <Typography gutterBottom variant="h5" component="div">
          {props.name}
        </Typography>
      </Box>
      <Box ref={drop}>
        {...tags}
      </Box>
    </CardContent>
    <CardActions>
      <Button size="small">Share</Button>
      <Button size="small">Learn More</Button>
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