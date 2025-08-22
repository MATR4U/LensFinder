"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateSpec = validateSpec;
function validateSpec(spec) {
    const errors = [];
    const visit = (node, path) => {
        if (!node)
            return;
        if (node.path && node.op) {
            if (typeof node.path !== 'string')
                errors.push({ message: 'path must be string', at: path });
            if (typeof node.op !== 'string')
                errors.push({ message: 'op must be string', at: path });
            return;
        }
        if (node.allOf && !Array.isArray(node.allOf))
            errors.push({ message: 'allOf must be array', at: path + '.allOf' });
        if (node.anyOf && !Array.isArray(node.anyOf))
            errors.push({ message: 'anyOf must be array', at: path + '.anyOf' });
        if (Array.isArray(node.allOf))
            node.allOf.forEach((c, i) => visit(c, `${path}.allOf[${i}]`));
        if (Array.isArray(node.anyOf))
            node.anyOf.forEach((c, i) => visit(c, `${path}.anyOf[${i}]`));
        if (node.not)
            visit(node.not, `${path}.not`);
    };
    visit(spec, '$');
    if (errors.length)
        return { ok: false, errors };
    return { ok: true };
}
