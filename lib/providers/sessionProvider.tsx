'use client';

import type {ReactNode} from 'react';
import {SessionProvider} from 'next-auth/react';

export const SessionsProvider = ({children}: {children: ReactNode}) => {
  return <SessionProvider>{children}</SessionProvider>;
};
