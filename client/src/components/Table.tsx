import React, { useMemo } from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable
} from '@tanstack/react-table';
import type { Result } from '../types';

type Props = {
  data: Result[];
  onSelect: (row: Result) => void;
  onCheckPrice?: (row: Result) => void;
  advanced?: boolean;
  priceOverrides?: Record<string, string>;
};

export default function Table({ data, onSelect, onCheckPrice, advanced = true, priceOverrides }: Props) {
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const columns = useMemo<ColumnDef<Result>[]>(() => {
    if (!advanced) {
      return [
        { header: 'Name', accessorKey: 'name' },
        { header: 'Type', cell: ({ row }) => (row.original.focal_min_mm === row.original.focal_max_mm ? 'Prime' : 'Zoom') },
        { header: 'Focal Range', cell: ({ row }) => `${row.original.focal_min_mm}-${row.original.focal_max_mm}mm` },
        { header: 'Aperture', cell: ({ row }) => `f/${row.original.aperture_min}${row.original.aperture_min !== row.original.aperture_max ? '-' + row.original.aperture_max : ''}` },
        { header: 'Weight', accessorKey: 'weight_g' },
        { header: 'Price', accessorKey: 'price_chf' },
        { header: 'Score', accessorKey: 'score_total' },
      ];
    }
    return [
      { header: 'Name', accessorKey: 'name' },
      { header: 'Focal', cell: ({ row }) => `${Math.round(row.original.focal_used_mm)}mm` },
      { header: 'Aperture', cell: ({ row }) => `f/${row.original.max_aperture_at_focal.toFixed(1)}` },
      { header: 'Eq. Focal', cell: ({ row }) => `${row.original.eq_focal_ff_mm.toFixed(1)}mm` },
      { header: 'Horiz. FoV', cell: ({ row }) => `${row.original.fov_h_deg.toFixed(1)}°` },
      { header: 'DoF Total', cell: ({ row }) => `${row.original.dof_total_m === Infinity ? '∞' : row.original.dof_total_m.toFixed(2)}m` },
      { header: 'Weight', accessorKey: 'weight_g' },
      { header: 'Price', cell: ({ row }) => priceOverrides?.[row.original.name] ?? `CHF ${row.original.price_chf}` },
      { header: 'Stab.', accessorKey: 'stabilization' },
      { header: 'Sealed', cell: ({ row }) => (row.original.weather_sealed ? '✅' : '❌') },
      { header: 'Macro', cell: ({ row }) => (row.original.is_macro ? '✅' : '❌') },
      { header: 'Score', accessorKey: 'score_total' },
      { header: '', cell: ({ row }) => <button className="bg-blue-600 text-white text-xs py-1 px-2 rounded" onClick={(e) => { e.stopPropagation(); onCheckPrice?.(row.original); }}>Check Price</button> },
    ];
  }, [advanced, onCheckPrice, priceOverrides]);

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel()
  });

  return (
    <table className="min-w-full">
      <thead className="bg-gray-800 sticky top-0">
        {table.getHeaderGroups().map((hg) => (
          <tr key={hg.id}>
            {hg.headers.map((h) => (
              <th key={h.id} className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody className="divide-y divide-gray-800">
        {table.getRowModel().rows.map((r) => (
          <tr key={r.id} className="hover:bg-gray-800/70 cursor-pointer" onClick={() => onSelect(r.original)}>
            {r.getVisibleCells().map((c) => (
              <td key={c.id} className="px-4 py-3 text-sm text-gray-300">{flexRender(c.column.columnDef.cell, c.getContext())}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}


