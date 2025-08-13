import React from 'react';
import Card from '../ui/Card';
import Message from '../ui/Message';

type Props = {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  isLoading?: boolean;
  isError?: boolean;
  isEmpty?: boolean;
  emptyMessage?: string;
  children: React.ReactNode;
};

export default function BaseReport({ title, subtitle, actions, isLoading, isError, isEmpty, emptyMessage = 'No data', children }: Props) {
  if (isLoading) return <Message variant="info" title={title}>Loading…</Message>;
  if (isError) return <Message variant="error" title={title}>We couldn’t load this report. Try again later.</Message>;
  if (isEmpty) return <Message variant="warning" title={title}>{emptyMessage}</Message>;
  return (
    <Card title={title} subtitle={subtitle} right={actions}>
      {children}
    </Card>
  );
}


