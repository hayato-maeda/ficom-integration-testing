import * as React from 'react';

import { cn } from '@/lib/utils';

/**
 * カードコンポーネント
 * コンテンツをグループ化するためのコンテナ
 * @param props - HTMLdiv要素の全てのprops
 * @param props.className - 追加のCSSクラス名
 */
function Card({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card"
      className={cn('bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm', className)}
      {...props}
    />
  );
}

/**
 * カードヘッダーコンポーネント
 * カードのタイトルと説明を含むヘッダー部分
 * @param props - HTMLdiv要素の全てのprops
 * @param props.className - 追加のCSSクラス名
 */
function CardHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        '@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6',
        className,
      )}
      {...props}
    />
  );
}

/**
 * カードタイトルコンポーネント
 * カードの見出しを表示します
 * @param props - HTMLdiv要素の全てのprops
 * @param props.className - 追加のCSSクラス名
 */
function CardTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="card-title" className={cn('leading-none font-semibold', className)} {...props} />;
}

/**
 * カード説明コンポーネント
 * カードの補足説明を表示します
 * @param props - HTMLdiv要素の全てのprops
 * @param props.className - 追加のCSSクラス名
 */
function CardDescription({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="card-description" className={cn('text-muted-foreground text-sm', className)} {...props} />;
}

/**
 * カードアクションコンポーネント
 * カードヘッダー内にアクションボタンなどを配置するためのコンテナ
 * @param props - HTMLdiv要素の全てのprops
 * @param props.className - 追加のCSSクラス名
 */
function CardAction({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-action"
      className={cn('col-start-2 row-span-2 row-start-1 self-start justify-self-end', className)}
      {...props}
    />
  );
}

/**
 * カードコンテンツコンポーネント
 * カードのメインコンテンツを含むコンテナ
 * @param props - HTMLdiv要素の全てのprops
 * @param props.className - 追加のCSSクラス名
 */
function CardContent({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="card-content" className={cn('px-6', className)} {...props} />;
}

/**
 * カードフッターコンポーネント
 * カードの下部にアクションやメタ情報を配置するためのコンテナ
 * @param props - HTMLdiv要素の全てのprops
 * @param props.className - 追加のCSSクラス名
 */
function CardFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div data-slot="card-footer" className={cn('flex items-center px-6 [.border-t]:pt-6', className)} {...props} />
  );
}

export { Card, CardHeader, CardFooter, CardTitle, CardAction, CardDescription, CardContent };
