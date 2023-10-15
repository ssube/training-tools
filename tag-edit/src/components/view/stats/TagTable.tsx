import { doesExist, mustExist } from '@apextoaster/js-utils';
import React, { useContext } from 'react';
import { useStore } from 'zustand';

import { Images, StateContext } from '../../../state.js';
import { TableContainer, Paper, Table, TableHead, TableRow, TableCell, TableBody, IconButton, Button } from '@mui/material';
import { Delete } from '@mui/icons-material';

export function TagTable() {
  const state = useContext(StateContext);
  const images = useStore(mustExist(state), (s) => s.images);
  const removeTag = useStore(mustExist(state), (s) => s.removeTag);

  const stats = tagStats(images);
  const rows = Object.entries(stats.count)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => <TableRow>
      <TableCell>{name}</TableCell>
      <TableCell align='right'>{count}</TableCell>
      <TableCell align='right'>{(count * 100 / stats.total).toFixed(2)}%</TableCell>
      <TableCell align='right'>
        <IconButton onClick={() => removeTag(name)}>
          <Delete />
        </IconButton>
      </TableCell>
    </TableRow>);

  return <TableContainer component={Paper}>
    <Table sx={{ minWidth: 650 }}>
      <TableHead>
        <TableRow>
          <TableCell>Tag</TableCell>
          <TableCell align='right'>Count</TableCell>
          <TableCell align='right'>Frequency</TableCell>
          <TableCell align='right'>Actions</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {...rows}
      </TableBody>
    </Table>
  </TableContainer>;
}

interface TagStats {
  count: Record<string, number>;
  total: number;
}

export function tagStats(images: Images): TagStats {
  const count: Map<string, number> = new Map();

  for (const image of Object.values(images)) {
    for (const tag of image.captions) {
      const prev = count.get(tag);
      if (doesExist(prev)) {
        count.set(tag, prev + 1);
      } else {
        count.set(tag, 1);
      }
    }
  }

  return {
    count: Object.fromEntries(count.entries()),
    total: count.size,
  };
}
