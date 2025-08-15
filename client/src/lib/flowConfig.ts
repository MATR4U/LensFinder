import { Stage } from '../types/availability';

export const flowConfig = {
  stages: [
    { id: Stage.Mode, name: 'Mode' },
    { id: Stage.Build, name: 'Build and capabilities' },
    { id: Stage.Requirements, name: 'Requirements' },
    { id: Stage.Compare, name: 'Compare' },
    { id: Stage.Report, name: 'Report' },
  ],
  transitions: {
    [Stage.Mode]: { next: Stage.Build },
    [Stage.Build]: { prev: Stage.Mode, next: Stage.Requirements },
    [Stage.Requirements]: { prev: Stage.Build, next: Stage.Compare },
    [Stage.Compare]: { prev: Stage.Requirements, next: Stage.Report },
    [Stage.Report]: { prev: Stage.Compare },
  },
} as const;


