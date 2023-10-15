import { TabContext, TabList, TabPanel } from '@mui/lab';
import { Box, Tab } from '@mui/material';
import React, { useState } from 'react';
import { ImageTab } from './view/image/Tab';
import { AllTab } from './view/all/Tab';

export function App() {
  const [tab, setTab] = useState('image');

  return <Box sx={{ width: '100%' }}>
    <TabContext value={tab}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <TabList onChange={(_e, key) => setTab(key)}>
          <Tab value='image' label="Image Tags" />
          <Tab value='all' label="All Tags" />
        </TabList>
      </Box>
      <TabPanel value='image'>
        <ImageTab />
      </TabPanel>
      <TabPanel value='all'>
        <AllTab />
      </TabPanel>
    </TabContext>
  </Box>;
}
