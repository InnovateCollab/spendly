import { Tabs, TabSlot, TabTrigger, TabList } from 'expo-router/ui';
import React from 'react';

import { TabButton } from './tab-button';
import { AddButton } from './add-button';
import { TabListContainer } from './tab-list-container';

export default function AppTabs() {
  return (
    <Tabs>
      <TabSlot style={{ height: '100%' }} />
      <TabList asChild>
        <TabListContainer>
          <TabTrigger name="timeline" href="/timeline" asChild>
            <TabButton>Timeline</TabButton>
          </TabTrigger>
          <AddButton />
          <TabTrigger name="overview" href="/overview" asChild>
            <TabButton>Overview</TabButton>
          </TabTrigger>
        </TabListContainer>
      </TabList>
    </Tabs>
  );
}
