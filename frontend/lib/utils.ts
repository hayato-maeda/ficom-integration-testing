import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Tailwind CSSのクラス名を結合するユーティリティ関数
 *
 * clsxとtailwind-mergeを組み合わせて、条件付きクラス名の結合と
 * Tailwindクラスの競合解決を行います。
 *
 * @param inputs - 結合するクラス名（文字列、オブジェクト、配列など）
 * @returns 結合されたクラス名文字列
 *
 * @example
 * ```tsx
 * cn('px-4 py-2', 'bg-blue-500')
 * // => 'px-4 py-2 bg-blue-500'
 *
 * cn('px-4', { 'py-2': true, 'bg-red-500': false })
 * // => 'px-4 py-2'
 *
 * cn('px-4 px-8') // Tailwindの競合を解決
 * // => 'px-8'
 * ```
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
