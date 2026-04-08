'use client';

import SubHeader from '../components/SubHeader';

export default function LessonsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <SubHeader />
      {children}
    </div>
  );
}
