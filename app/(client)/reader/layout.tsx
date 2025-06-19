// File: app/(client)/reader/layout.tsx
import React from 'react';

export default function ReaderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section>
      {children}
    </section>
  );
}