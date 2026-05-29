/**
 * Debounce Hook
 *
 * @description 防抖 Hook，用于延迟执行函数
 * 常用于搜索输入和自动保存场景
 *
 * @module useDebounce
 */
import { useState, useEffect } from "react";

/**
 * Debounce Hook
 *
 * @description 延迟更新值，适用于搜索输入等高频触发场景
 *
 * @param value - 需要防抖的值
 * @param delay - 延迟时间（毫秒）
 * @returns [debouncedValue] - 防抖后的值
 *
 * @example
 * const [searchTerm, setSearchTerm] = useState("");
 * const [debouncedTerm] = useDebounce(searchTerm, 500);
 * useEffect(() => {
 *   if (debouncedTerm) {
 *     // 执行搜索
 *   }
 * }, [debouncedTerm]);
 */
export function useDebounce<T>(value: T, delay: number): [T] {
  // 存储防抖后的值
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // 创建定时器
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // 清理函数：在下一个 useEffect 执行前清除定时器
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return [debouncedValue];
}