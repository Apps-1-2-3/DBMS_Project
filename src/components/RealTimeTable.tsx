import React, { useState, useEffect, useCallback } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { RefreshCw } from 'lucide-react';

interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (item: T) => React.ReactNode;
}

interface RealTimeTableProps<T> {
  fetchData: () => Promise<T[]>;
  columns: Column<T>[];
  refreshInterval?: number;
  emptyMessage?: string;
  keyField: keyof T;
}

export function RealTimeTable<T extends object>({
  fetchData,
  columns,
  refreshInterval = 3000,
  emptyMessage = 'No data available',
  keyField,
}: RealTimeTableProps<T>) {
  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadData = useCallback(async (showRefreshIndicator = false) => {
    try {
      if (showRefreshIndicator) setIsRefreshing(true);
      const result = await fetchData();
      setData(result);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [fetchData]);

  useEffect(() => {
    loadData();
    const interval = setInterval(() => loadData(true), refreshInterval);
    return () => clearInterval(interval);
  }, [loadData, refreshInterval]);

  const getValue = (item: T, key: string): unknown => {
    if (key.includes('.')) {
      return key.split('.').reduce((obj, k) => (obj as Record<string, unknown>)?.[k], item as unknown);
    }
    return (item as Record<string, unknown>)[key];
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin text-accent' : ''}`} />
          <span>Auto-refresh every {refreshInterval / 1000}s</span>
        </div>
        {lastUpdated && (
          <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
        )}
      </div>
      
      <div className="rounded-lg border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              {columns.map((col) => (
                <TableHead key={String(col.key)} className="font-semibold text-foreground">
                  {col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-32 text-center text-muted-foreground">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              data.map((item, index) => (
                <TableRow key={String((item as Record<string, unknown>)[keyField as string]) || index} className="transition-colors hover:bg-muted/30">
                  {columns.map((col) => (
                    <TableCell key={String(col.key)}>
                      {col.render ? col.render(item) : String(getValue(item, String(col.key)) ?? '')}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export default RealTimeTable;
