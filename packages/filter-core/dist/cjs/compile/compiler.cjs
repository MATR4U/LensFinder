"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.compile = compile;
const accessors_1 = require("./accessors");
const numOps = require("../ops/numeric");
const strOps = require("../ops/string");
const arrOps = require("../ops/array");
const boolOps = require("../ops/boolean");
const vecOps = require("../ops/vector");
function flatten(spec, acc = []) {
    if (spec.path) {
        acc.push(spec);
        return acc;
    }
    if (spec.allOf)
        spec.allOf.forEach(s => flatten(s, acc));
    if (spec.anyOf)
        spec.anyOf.forEach(s => flatten(s, acc));
    if (spec.not)
        flatten(spec.not, acc);
    return acc;
}
function factoryFor(op) {
    if (numOps.OPS?.includes(op))
        return { hard: (v) => numOps.cmpFactory(op, v), soft: (x, v) => numOps.softScore(op, x, v) };
    if (strOps.OPS?.includes(op))
        return { hard: (v) => strOps.cmpFactory(op, v), soft: (x, v) => strOps.softScore(op, x, v) };
    if (arrOps.OPS?.includes(op))
        return { hard: (v) => arrOps.cmpFactory(op, v), soft: (x, v) => arrOps.softScore(op, x, v) };
    if (boolOps.OPS?.includes(op))
        return { hard: (v) => boolOps.cmpFactory(op, v), soft: (x, v) => boolOps.softScore(op, x, v) };
    if (vecOps.OPS?.includes(op))
        return { hard: (v) => vecOps.cmpFactory(op, v), soft: (x, v) => vecOps.softScore(op, x, v) };
    return { hard: () => () => false, soft: () => 0 };
}
function compile(spec) {
    const clauses = flatten(spec);
    const compiled = clauses.map(c => {
        const { hard, soft } = factoryFor(c.op);
        return {
            clause: c,
            getter: (0, accessors_1.makeGetter)(c.path),
            hard: hard(c.value),
            soft: (val) => soft(val, c.value),
            weight: c.weight ?? 1
        };
    });
    return {
        clauses,
        test: (item) => {
            for (const c of compiled) {
                const v = c.getter(item);
                const mode = c.clause.mode ?? 'hard';
                if (mode === 'hard' && !c.hard(v))
                    return false;
            }
            return true;
        },
        score: (item) => {
            const parts = [];
            for (const c of compiled) {
                const v = c.getter(item);
                const mode = c.clause.mode ?? 'hard';
                if (mode === 'soft') {
                    parts.push(c.weight * c.soft(v));
                }
                else {
                    parts.push(0);
                }
            }
            const total = parts.reduce((a, b) => a + b, 0);
            return { total, parts };
        }
    };
}
