import React from 'react';

import { Switch } from '@/components/ui/switch';
import type { NextPageWithLayout } from '@/types';

const CommonPage: NextPageWithLayout = () => {
  return (
    <>
      <h1>Switch</h1>
      <div>
        <Switch />
      </div>
      <h1>Check Box</h1>
    </>
  );
};

export default CommonPage;
