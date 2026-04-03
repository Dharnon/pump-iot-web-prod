import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { useDataGrid } from '@/components/ui/data-grid';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DataGridPaginationProps {
  sizes?: number[];
  sizesInfo?: string;
  sizesLabel?: string;
  sizesDescription?: string;
  sizesSkeleton?: ReactNode;
  more?: boolean;
  moreLimit?: number;
  info?: string;
  infoSkeleton?: ReactNode;
  className?: string;
  rowsPerPageLabel?: string;
  previousPageLabel?: string;
  nextPageLabel?: string;
  firstPageLabel?: string;
  lastPageLabel?: string;
  ellipsisText?: string;
  /** @default 'default' — 'data-table' matches shadcn: selection left, rows/page + page + arrows right */
  variant?: 'default' | 'data-table';
  /** Template: {selected}, {total} — shown when variant is data-table and showSelectionSummary */
  selectionSummary?: string;
  showSelectionSummary?: boolean;
  /** Template: {page}, {pages} */
  pageLabel?: string;
}

function DataGridPagination(props: DataGridPaginationProps) {
  const { table, recordCount, isLoading } = useDataGrid();

  const defaultProps: Partial<DataGridPaginationProps> = {
    sizes: [5, 10, 25, 50, 100],
    sizesLabel: 'Show',
    sizesDescription: 'per page',
    sizesSkeleton: <Skeleton className="h-8 w-44" />,
    moreLimit: 5,
    more: false,
    info: '{from} - {to} of {count}',
    infoSkeleton: <Skeleton className="h-8 w-60" />,
    rowsPerPageLabel: 'Rows per page',
    previousPageLabel: 'Go to previous page',
    nextPageLabel: 'Go to next page',
    firstPageLabel: 'Go to first page',
    lastPageLabel: 'Go to last page',
    ellipsisText: '...',
    variant: 'default',
    selectionSummary: '{selected} of {total} row(s) selected.',
    showSelectionSummary: false,
    pageLabel: 'Page {page} of {pages}',
  };

  const mergedProps: DataGridPaginationProps = { ...defaultProps, ...props };

  const btnArrowClasses = 'size-8 shrink-0 p-0 rtl:rotate-180';
  const pageIndex = table.getState().pagination.pageIndex;
  const pageSize = table.getState().pagination.pageSize;
  const from = recordCount === 0 ? 0 : pageIndex * pageSize + 1;
  const to = Math.min((pageIndex + 1) * pageSize, recordCount);
  const pageCount = Math.max(1, table.getPageCount());

  const paginationInfo = mergedProps?.info
    ? mergedProps.info
        .replace('{from}', from.toString())
        .replace('{to}', to.toString())
        .replace('{count}', recordCount.toString())
    : `${from} - ${to} of ${recordCount}`;

  const selectedCount = table.getFilteredSelectedRowModel().rows.length;
  const filteredTotal = table.getFilteredRowModel().rows.length;
  const selectionSummaryText = mergedProps.selectionSummary
    ? mergedProps.selectionSummary
        .replace('{selected}', selectedCount.toString())
        .replace('{total}', filteredTotal.toString())
    : '';

  const pageLabelText = mergedProps.pageLabel
    ? mergedProps.pageLabel
        .replace('{page}', (pageIndex + 1).toString())
        .replace('{pages}', pageCount.toString())
    : '';

  const paginationMoreLimit = mergedProps.moreLimit || 5;
  const currentGroupStart = Math.floor(pageIndex / paginationMoreLimit) * paginationMoreLimit;
  const currentGroupEnd = Math.min(currentGroupStart + paginationMoreLimit, pageCount);

  const renderPageButtons = () => {
    const buttons = [];
    for (let i = currentGroupStart; i < currentGroupEnd; i++) {
      buttons.push(
        <Button
          key={i}
          size="sm"
          mode="icon"
          variant="ghost"
          className={cn('h-8 w-8 text-xs text-muted-foreground', {
            'bg-primary/10 text-primary border border-primary/30': pageIndex === i,
          })}
          onClick={() => {
            if (pageIndex !== i) {
              table.setPageIndex(i);
            }
          }}
        >
          {i + 1}
        </Button>,
      );
    }
    return buttons;
  };

  const renderEllipsisPrevButton = () => {
    if (currentGroupStart > 0) {
      return (
        <Button
          size="sm"
          mode="icon"
          className="h-8 w-8 text-xs"
          variant="ghost"
          onClick={() => table.setPageIndex(currentGroupStart - 1)}
        >
          {mergedProps.ellipsisText}
        </Button>
      );
    }
    return null;
  };

  const renderEllipsisNextButton = () => {
    if (currentGroupEnd < pageCount) {
      return (
        <Button
          className="h-8 w-8 text-xs"
          variant="ghost"
          size="sm"
          mode="icon"
          onClick={() => table.setPageIndex(currentGroupEnd)}
        >
          {mergedProps.ellipsisText}
        </Button>
      );
    }
    return null;
  };

  const rowsPerPageBlock = (
    <>
      <span className="whitespace-nowrap text-sm text-muted-foreground">
        {mergedProps.rowsPerPageLabel}
      </span>
      <Select
        value={`${pageSize}`}
        indicatorPosition="right"
        onValueChange={(value) => {
          table.setPageSize(Number(value));
        }}
      >
        <SelectTrigger className="h-8 w-[4.5rem] border-border/60 text-xs" size="sm">
          <SelectValue placeholder={`${pageSize}`} />
        </SelectTrigger>
        <SelectContent side="top" className="min-w-[50px]">
          {mergedProps?.sizes?.map((size: number) => (
            <SelectItem key={size} value={`${size}`}>
              {size}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </>
  );

  const navButtons = (
    <div className="flex items-center gap-1">
      <Button
        size="sm"
        mode="icon"
        variant="outline"
        className={cn(btnArrowClasses, 'hidden sm:inline-flex')}
        onClick={() => table.setPageIndex(0)}
        disabled={!table.getCanPreviousPage()}
      >
        <span className="sr-only">{mergedProps.firstPageLabel}</span>
        <ChevronsLeftIcon className="size-4" />
      </Button>
      <Button
        size="sm"
        mode="icon"
        variant="outline"
        className={btnArrowClasses}
        onClick={() => table.previousPage()}
        disabled={!table.getCanPreviousPage()}
      >
        <span className="sr-only">{mergedProps.previousPageLabel}</span>
        <ChevronLeftIcon className="size-4" />
      </Button>

      <div className="hidden items-center gap-1 sm:flex">
        {renderEllipsisPrevButton()}
        {renderPageButtons()}
        {renderEllipsisNextButton()}
      </div>

      <Button
        size="sm"
        mode="icon"
        variant="outline"
        className={btnArrowClasses}
        onClick={() => table.nextPage()}
        disabled={!table.getCanNextPage()}
      >
        <span className="sr-only">{mergedProps.nextPageLabel}</span>
        <ChevronRightIcon className="size-4" />
      </Button>
      <Button
        size="sm"
        mode="icon"
        variant="outline"
        className={cn(btnArrowClasses, 'hidden sm:inline-flex')}
        onClick={() => table.setPageIndex(Math.max(0, pageCount - 1))}
        disabled={!table.getCanNextPage()}
      >
        <span className="sr-only">{mergedProps.lastPageLabel}</span>
        <ChevronsRightIcon className="size-4" />
      </Button>
    </div>
  );

  if (mergedProps.variant === 'data-table') {
    return (
      <div
        data-slot="data-grid-pagination"
        className={cn(
          'flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4',
          mergedProps?.className,
        )}
      >
        {mergedProps.showSelectionSummary ? (
          <div className="hidden flex-1 text-sm text-muted-foreground lg:flex">
            {selectionSummaryText}
          </div>
        ) : null}

        <div className="flex w-full flex-col gap-3 sm:ml-auto sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:justify-end sm:gap-6">
          {isLoading ? (
            mergedProps?.sizesSkeleton
          ) : (
            <div className="flex min-w-0 items-center gap-2">{rowsPerPageBlock}</div>
          )}

          {!isLoading ? (
            <>
              <div className="flex w-full min-w-0 items-center justify-center text-sm font-medium tabular-nums sm:w-auto sm:justify-end">
                {pageLabelText}
              </div>
              {navButtons}
            </>
          ) : (
            mergedProps?.infoSkeleton
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      data-slot="data-grid-pagination"
      className={cn(
        'flex flex-col gap-3 px-4 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-4',
        mergedProps?.className,
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-2 sm:max-w-[min(100%,20rem)]">
        {isLoading ? (
          mergedProps?.sizesSkeleton
        ) : (
          <>
            <span className="whitespace-nowrap text-sm text-muted-foreground">
              {mergedProps.rowsPerPageLabel}
            </span>
            <Select
              value={`${pageSize}`}
              indicatorPosition="right"
              onValueChange={(value) => {
                table.setPageSize(Number(value));
              }}
            >
              <SelectTrigger className="h-8 w-[4.5rem] border-border/60 text-xs" size="sm">
                <SelectValue placeholder={`${pageSize}`} />
              </SelectTrigger>
              <SelectContent side="top" className="min-w-[50px]">
                {mergedProps?.sizes?.map((size: number) => (
                  <SelectItem key={size} value={`${size}`}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-end gap-3 sm:justify-end">
        {isLoading ? (
          mergedProps?.infoSkeleton
        ) : (
          <>
            <div className="min-w-0 text-center text-sm tabular-nums text-muted-foreground sm:text-right">
              {paginationInfo}
            </div>
            {pageCount > 1 && navButtons}
          </>
        )}
      </div>
    </div>
  );
}

export { DataGridPagination, type DataGridPaginationProps };
