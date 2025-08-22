import { FilterSpec, RankOptions } from '../types';

export type SqlDialect = 'postgres' | 'mysql' | 'sqlite';

export type SqlQuery = {
  text: string;
  params: unknown[];
};

export interface DbApiTranslator {
  toWhere(spec: FilterSpec, dialect: SqlDialect): SqlQuery;
  toOrderBy(spec: FilterSpec, options: RankOptions, dialect: SqlDialect): string;
}
