import React from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { copyCurrentUrlToClipboard } from './share';
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
  onExportCSV?: () => void;
  shareable?: boolean;
};

export default function BaseReport({ title, subtitle, actions, isLoading, isError, isEmpty, emptyMessage = 'No data', children, onExportCSV, shareable = true }: Props) {
  if (isLoading) return <Message variant="info" title={title}>Loading…</Message>;
  if (isError) return <Message variant="error" title={title}>We couldn’t load this report. Try again later.</Message>;
  if (isEmpty) return <Message variant="warning" title={title}>{emptyMessage}</Message>;
  const right = (
    <div className="flex items-center gap-2">
      {actions}
      {onExportCSV && (
        <Button variant="secondary" size="sm" onClick={onExportCSV}>Export CSV</Button>
      )}
      {shareable && (
        <Button variant="secondary" size="sm" onClick={() => void copyCurrentUrlToClipboard()}>Share link</Button>
      )}
    </div>
  );
  return (
    <Card title={title} subtitle={subtitle} right={right}>
      {children}
    </Card>
  );
}


