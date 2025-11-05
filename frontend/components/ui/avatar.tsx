'use client';

import * as React from 'react';
import * as AvatarPrimitive from '@radix-ui/react-avatar';

import { cn } from '@/lib/utils';

/**
 * アバターコンポーネントのルート要素
 * ユーザーのプロフィール画像や代替表示を表示するためのコンテナ
 * @param props - Radix UI Avatar.Rootの全てのprops
 * @param props.className - 追加のCSSクラス名
 */
function Avatar({ className, ...props }: React.ComponentProps<typeof AvatarPrimitive.Root>) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      className={cn('relative flex size-8 shrink-0 overflow-hidden rounded-full', className)}
      {...props}
    />
  );
}

/**
 * アバター画像コンポーネント
 * ユーザーのプロフィール画像を表示します。読み込みに失敗した場合はフォールバックが表示されます
 * @param props - Radix UI Avatar.Imageの全てのprops
 * @param props.className - 追加のCSSクラス名
 */
function AvatarImage({ className, ...props }: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image data-slot="avatar-image" className={cn('aspect-square size-full', className)} {...props} />
  );
}

/**
 * アバターのフォールバックコンポーネント
 * 画像が読み込めない場合や設定されていない場合に表示される代替コンテンツ（通常はイニシャルなど）
 * @param props - Radix UI Avatar.Fallbackの全てのprops
 * @param props.className - 追加のCSSクラス名
 */
function AvatarFallback({ className, ...props }: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn('bg-muted flex size-full items-center justify-center rounded-full', className)}
      {...props}
    />
  );
}

export { Avatar, AvatarImage, AvatarFallback };
