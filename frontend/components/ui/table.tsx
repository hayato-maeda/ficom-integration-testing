'use client';

import * as React from 'react';

import { cn } from '@/lib/utils';

/**
 * テーブルコンポーネント
 * データを表形式で表示するためのテーブルコンテナ。横スクロールをサポート
 * @param props - HTMLtable要素の全てのprops
 * @param props.className - 追加のCSSクラス名
 */
function Table({ className, ...props }: React.ComponentProps<'table'>) {
  return (
    <div data-slot="table-container" className="relative w-full overflow-x-auto">
      <table data-slot="table" className={cn('w-full caption-bottom text-sm', className)} {...props} />
    </div>
  );
}

/**
 * テーブルヘッダーコンポーネント
 * テーブルの列見出しを含むヘッダーセクション
 * @param props - HTMLthead要素の全てのprops
 * @param props.className - 追加のCSSクラス名
 */
function TableHeader({ className, ...props }: React.ComponentProps<'thead'>) {
  return <thead data-slot="table-header" className={cn('[&_tr]:border-b', className)} {...props} />;
}

/**
 * テーブルボディコンポーネント
 * テーブルのデータ行を含む本体セクション
 * @param props - HTMLtbody要素の全てのprops
 * @param props.className - 追加のCSSクラス名
 */
function TableBody({ className, ...props }: React.ComponentProps<'tbody'>) {
  return <tbody data-slot="table-body" className={cn('[&_tr:last-child]:border-0', className)} {...props} />;
}

/**
 * テーブルフッターコンポーネント
 * テーブルの集計情報などを表示するフッターセクション
 * @param props - HTMLtfoot要素の全てのprops
 * @param props.className - 追加のCSSクラス名
 */
function TableFooter({ className, ...props }: React.ComponentProps<'tfoot'>) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn('bg-muted/50 border-t font-medium [&>tr]:last:border-b-0', className)}
      {...props}
    />
  );
}

/**
 * テーブル行コンポーネント
 * テーブルの1行を表します。ホバーと選択状態をサポート
 * @param props - HTMLtr要素の全てのprops
 * @param props.className - 追加のCSSクラス名
 */
function TableRow({ className, ...props }: React.ComponentProps<'tr'>) {
  return (
    <tr
      data-slot="table-row"
      className={cn('hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors', className)}
      {...props}
    />
  );
}

/**
 * テーブルヘッドセルコンポーネント
 * テーブルの列見出しセル
 * @param props - HTMLth要素の全てのprops
 * @param props.className - 追加のCSSクラス名
 */
function TableHead({ className, ...props }: React.ComponentProps<'th'>) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        'text-foreground h-10 px-2 text-left align-middle font-medium whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]',
        className,
      )}
      {...props}
    />
  );
}

/**
 * テーブルセルコンポーネント
 * テーブルのデータセル
 * @param props - HTMLtd要素の全てのprops
 * @param props.className - 追加のCSSクラス名
 */
function TableCell({ className, ...props }: React.ComponentProps<'td'>) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        'p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]',
        className,
      )}
      {...props}
    />
  );
}

/**
 * テーブルキャプションコンポーネント
 * テーブルのタイトルや説明を表示します
 * @param props - HTMLcaption要素の全てのprops
 * @param props.className - 追加のCSSクラス名
 */
function TableCaption({ className, ...props }: React.ComponentProps<'caption'>) {
  return (
    <caption data-slot="table-caption" className={cn('text-muted-foreground mt-4 text-sm', className)} {...props} />
  );
}

export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption };
