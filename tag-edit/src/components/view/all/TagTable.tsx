import { doesExist, mustExist } from '@apextoaster/js-utils';
import React, { useContext } from 'react';
import { useStore } from 'zustand';
import { Images, StateContext } from '../../../state.js';

export function TagTable() {
  const state = useContext(StateContext);
  const images = useStore(mustExist(state), (s) => s.images);
  const stats = tagStats(images);
  const rows = Object.entries(stats.count)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => <tr>
      <td>{name}</td>
      <td>{count}</td>
      <td>{(count * 100 / stats.total).toFixed(2)}%</td>
    </tr>);

  return <table>
    <tbody>
      {...rows}
    </tbody>
  </table>
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
