'use client';

import React, { useEffect } from 'react';

const Axe: React.FC = () => {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      import('react-axe').then(axe => {
        axe.default(React, require('react-dom'), 1000);
      });
    }
  }, []);

  return null;
};

export default Axe;
