import React, { useMemo } from 'react';
import Button from './ui/Button';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable
} from '@tanstack/react-table';
import type { Result } from '../types';
import { useFilterStore } from '../stores/filterStore';

type Props = {
  data: Result[];
  onSelect?: (row: Result) => void;
  onCheckPrice?: (row: Result) => void;
  advanced?: boolean;
  priceOverrides?: Record<string, string>;
  columnsMode?: 'advanced' | 'compare-minimal' | 'simple';
};

export default function Table({ data, onSelect, onCheckPrice, advanced = true, priceOverrides, columnsMode }: Props) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const setSelected = useFilterStore(s => s.setSelected);
  const compareList = useFilterStore(s => s.compareList);
  const toggleCompare = useFilterStore(s => s.toggleCompare);

  const columns = useMemo<ColumnDef<Result>[]>(() => {
    if (columnsMode === 'compare-minimal') {
      return [
        { id: 'name', header: 'Name', cell: ({ row }) => row.original.name },
        { id: 'score', header: 'Score', cell: ({ row }) => row.original.score_total.toFixed(0) },
        { id: 'price', header: 'Price', cell: ({ row }) => `CHF ${row.original.price_chf}` },
        { id: 'weight', header: 'Weight', cell: ({ row }) => `${row.original.weight_g} g` },
        { id: 'aperture', header: 'Aperture', cell: ({ row }) => `f/${row.original.max_aperture_at_focal.toFixed(1)}` },
        { id: 'eq', header: 'Eq. Focal', cell: ({ row }) => `${row.original.eq_focal_ff_mm.toFixed(1)} mm` },
        {
          id: 'compare', header: '', cell: ({ row }) => (
            <Button size="xs" onClick={(e) => { e.stopPropagation(); toggleCompare(row.original.name); }}>
              {compareList.includes(row.original.name) ? 'Remove' : '+ Compare'}
            </Button>
          )
        },
      ];
    }
    if (!advanced || columnsMode === 'simple') {
      return [
        {
          id: 'name', header: 'Name', cell: ({ row }) => (
            <a
              href={row.original.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-[var(--accent)]"
              onClick={(e) => e.stopPropagation()}
            >
              {row.original.name}
            </a>
          )
        },
        { id: 'type', header: 'Type', cell: ({ row }) => (row.original.focal_min_mm === row.original.focal_max_mm ? 'Prime' : 'Zoom') },
        { id: 'focal_range', header: 'Focal Range', cell: ({ row }) => `${row.original.focal_min_mm}-${row.original.focal_max_mm}mm` },
        { id: 'aperture_range', header: 'Aperture', cell: ({ row }) => `f/${row.original.aperture_min}${row.original.aperture_min !== row.original.aperture_max ? '-' + row.original.aperture_max : ''}` },
        { header: 'Weight', accessorKey: 'weight_g' },
        { header: 'Price', accessorKey: 'price_chf' },
        { header: 'Score', accessorKey: 'score_total' },
      ];
    }
    const defs: ColumnDef<Result>[] = [
      {
        id: 'name', header: 'Name', cell: ({ row }) => (
          <a
            href={row.original.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-[var(--accent)]"
            onClick={(e) => e.stopPropagation()}
          >
            {row.original.name}
          </a>
        )
      },
      { id: 'focal_used', header: 'Focal', cell: ({ row }) => `${Math.round(row.original.focal_used_mm)}mm` },
      { id: 'aperture', header: 'Aperture', cell: ({ row }) => `f/${row.original.max_aperture_at_focal.toFixed(1)}` },
      { id: 'eq_focal', header: 'Eq. Focal', cell: ({ row }) => `${row.original.eq_focal_ff_mm.toFixed(1)}mm` },
      { id: 'fov_h', header: 'Horiz. FoV', cell: ({ row }) => `${row.original.fov_h_deg.toFixed(1)}°` },
      { id: 'dof_total', header: 'DoF Total', cell: ({ row }) => `${row.original.dof_total_m === Infinity ? '∞' : row.original.dof_total_m.toFixed(2)}m` },
      { header: 'Weight', accessorKey: 'weight_g' },
      { id: 'price', header: 'Price', cell: ({ row }) => priceOverrides?.[row.original.name] ?? `CHF ${row.original.price_chf}` },
      { header: 'Stab.', accessorKey: 'stabilization' },
      { id: 'sealed', header: 'Sealed', cell: ({ row }) => (row.original.weather_sealed ? '✅' : '❌') },
      { id: 'macro', header: 'Macro', cell: ({ row }) => (row.original.is_macro ? '✅' : '❌') },
      { header: 'Score', accessorKey: 'score_total' },
      {
        id: 'compare', header: '', cell: ({ row }) => (
          <Button size="xs" onClick={(e) => { e.stopPropagation(); toggleCompare(row.original.name); }}>
            {compareList.includes(row.original.name) ? 'Remove' : '+ Compare'}
          </Button>
        )
      },
    ];
    if (onCheckPrice) {
      defs.push({ id: 'check_price', header: '', cell: ({ row }) => <Button size="xs" onClick={(e) => { e.stopPropagation(); onCheckPrice?.(row.original); }}>Check Price</Button> });
    }
    return defs;
  }, [advanced, onCheckPrice, priceOverrides, compareList, toggleCompare, columnsMode]);

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel()
  });

  return (
    <table className="min-w-full text-sm">
      <thead className="bg-[var(--control-bg)] sticky top-0">
        {table.getHeaderGroups().map((hg) => (
          <tr key={hg.id}>
            {hg.headers.map((h) => (
              <th key={h.id} className="px-4 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody className="divide-y divide-[var(--border-default)]">
        {table.getRowModel().rows.map((r) => (
          <tr key={r.id} className="hover:bg-[color-mix(in_oklab,var(--control-bg),white_5%)] cursor-pointer" onClick={() => (onSelect ? onSelect(r.original) : setSelected(r.original))}>
            {r.getVisibleCells().map((c) => (
              <td key={c.id} className="px-4 py-3 text-[var(--text-color)]">{flexRender(c.column.columnDef.cell, c.getContext())}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}


