import React from 'react';
import { LOADING_TEXT_SM } from './styles';

type Props = {
  text?: string;
  className?: string;
};

export default function Loading({ text = 'Loading…', className = '' }: Props) {
  return (
    <div className={`${LOADING_TEXT_SM} ${className}`}>{text}</div>
  );
}


