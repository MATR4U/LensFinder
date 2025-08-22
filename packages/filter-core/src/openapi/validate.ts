import { Clause, FilterSpec, ValidationError } from '../types';

export function validateSpec(spec: FilterSpec): { ok: true } | { ok: false; errors: ValidationError[] } {
  const errors: ValidationError[] = [];
  const visit = (node: any, path: string) => {
    if (!node) return;
    if ((node as Clause).path && (node as Clause).op) {
      if (typeof (node as Clause).path !== 'string') errors.push({ message: 'path must be string', at: path });
      if (typeof (node as Clause).op !== 'string') errors.push({ message: 'op must be string', at: path });
      return;
    }
    if (node.allOf && !Array.isArray(node.allOf)) errors.push({ message: 'allOf must be array', at: path + '.allOf' });
    if (node.anyOf && !Array.isArray(node.anyOf)) errors.push({ message: 'anyOf must be array', at: path + '.anyOf' });
    if (Array.isArray(node.allOf)) node.allOf.forEach((c: any, i: number) => visit(c, `${path}.allOf[${i}]`));
    if (Array.isArray(node.anyOf)) node.anyOf.forEach((c: any, i: number) => visit(c, `${path}.anyOf[${i}]`));
    if (node.not) visit(node.not, `${path}.not`);
  };
  visit(spec, '$');
  if (errors.length) return { ok: false, errors };
  return { ok: true };
}
