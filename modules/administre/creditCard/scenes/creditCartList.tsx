import {ReactNode} from 'react';

export interface ICartListProps<T = any> {
  data: Array<T>;
  cartItem: (item: T, index: number) => ReactNode;
  getKey?: (item: T, index: number) => React.Key;
  isLoading?: boolean;
  skeletonCount?: number;
  emptyState?: ReactNode;
  className?: string;
  columns?: Partial<Record<'base' | 'sm' | 'md' | 'lg' | 'xl', 1 | 2 | 3 | 4 | 6 | 12>>;
  gap?: 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10;
}

export const CreditCartList = <T,>({
  data,
  cartItem,
  getKey,
  isLoading,
  skeletonCount,
  emptyState,
  className,
  columns,
  gap,
}: ICartListProps<T>) => {
  const cols = {
    base: 1 as 1 | 2 | 3 | 4 | 6 | 12,
    md: 2 as 1 | 2 | 3 | 4 | 6 | 12,
    lg: 3 as 1 | 2 | 3 | 4 | 6 | 12,
    xl: 4 as 1 | 2 | 3 | 4 | 6 | 12,
    ...(columns || {}),
  };

  const colSpanMap = (prefix: 'sm' | 'md' | 'lg' | 'xl', n: 1 | 2 | 3 | 4 | 6 | 12) => {
    const map: Record<string, string> = {
      [`${prefix}-1`]: `${prefix}:col-span-12`,
      [`${prefix}-2`]: `${prefix}:col-span-6`,
      [`${prefix}-3`]: `${prefix}:col-span-4`,
      [`${prefix}-4`]: `${prefix}:col-span-3`,
      [`${prefix}-6`]: `${prefix}:col-span-2`,
      [`${prefix}-12`]: `${prefix}:col-span-1`,
    };
    return map[`${prefix}-${n}`];
  };

  const itemCols = [
    'col-span-12',
    cols.sm ? colSpanMap('sm', cols.sm) : '',
    colSpanMap('md', cols.md),
    colSpanMap('lg', cols.lg),
    colSpanMap('xl', cols.xl),
  ]
    .filter(Boolean)
    .join(' ');

  const wrapperGap =
    gap === 1
      ? ' gap-1'
      : gap === 2
      ? ' gap-2'
      : gap === 3
      ? ' gap-3'
      : gap === 4
      ? ' gap-4'
      : gap === 5
      ? ' gap-5'
      : gap === 6
      ? ' gap-6'
      : gap === 8
      ? ' gap-8'
      : gap === 10
      ? ' gap-10'
      : ' gap-4';

  if (isLoading) {
    const count = skeletonCount ?? Math.min(8, Math.max(4, (cols.md || 2) * 3));
    return (
      <div className={`grid grid-cols-12${wrapperGap} ${className || ''}`}>
        {Array.from({length: count}).map((_, i) => (
          <div key={i} className={`${itemCols} min-w-0`}>
            <div className='h-48 w-full rounded-md bg-gray-200 animate-pulse' />
          </div>
        ))}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className={`grid grid-cols-12${wrapperGap} ${className || ''}`}>
        <div className='col-span-12'>{emptyState || null}</div>
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-12${wrapperGap} ${className || ''}`}>
      {data.map((item, index) => (
        <div key={(getKey && getKey(item, index)) || index} className={`${itemCols} min-w-0`}>
          {cartItem(item, index)}
        </div>
      ))}
    </div>
  );
};
