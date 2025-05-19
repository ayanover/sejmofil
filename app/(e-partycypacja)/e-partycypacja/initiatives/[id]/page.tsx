'use client';

import InitiativeDetail from '@/components/e-partycypacja/InitiativeDetail';

export default function InitiativeDetailPage({ params }: { params: { id: string } }) {
  return <InitiativeDetail id={params.id} />;
}