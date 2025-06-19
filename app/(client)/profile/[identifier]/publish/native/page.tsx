// app/(client)/profile/[identifier]/publish/native/page.tsx
'use client'

import React, { use } from 'react';
import TokenGate from '../../../../../../components/publishing/TokenGate';
import NativePublishingForm from '../../../../../../components/publishing/NativePublishingForm';

export default function NativePublishPage({ params }: { params: Promise<{ identifier: string }> }) {
  const resolvedParams = use(params);
  const identifier = resolvedParams.identifier;
  
  return (
    <div>
      <TokenGate profileId={identifier} publishingType="native">
        <NativePublishingForm authorId={identifier} />
      </TokenGate>
    </div>
  );
}