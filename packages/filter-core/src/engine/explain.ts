import { Executable, Explanation } from '../types';

export function explain(item: unknown, exec: Executable): Explanation {
  const parts = exec.clauses.map((c, idx) => {
    const isSoft = (c.mode ?? 'hard') === 'soft';
    const res = exec.score(item as any);
    const contribution = isSoft ? res.parts[idx] : 0;
    const pass = isSoft ? contribution > 0 : exec.test(item as any);
    return { clause: c, pass, contribution };
  });
  const total = parts.reduce((a, b) => a + b.contribution, 0);
  const pass = exec.test(item as any);
  return { pass, parts, total };
}
