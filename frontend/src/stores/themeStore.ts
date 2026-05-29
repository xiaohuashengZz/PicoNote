/**
 * 主题状态管理模块
 *
 * @description 管理应用的主题配置（亮色/暗色/跟随系统）
 * 支持持久化存储用户偏好
 *
 * @module themeStore
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * 主题类型
 */
export type Theme = "light" | "dark" | "system";

/**
 * 解析后的实际主题
 */
export type ResolvedTheme = "light" | "dark";

/**
 * 主题 Store 状态接口
 */
interface ThemeState {
  /** 用户选择的主题 */
  theme: Theme;
  /** 解析后的实际主题 */
  resolvedTheme: ResolvedTheme;
}

/**
 * 主题 Store 操作接口
 */
interface ThemeActions {
  /** 设置主题 */
  setTheme: (theme: Theme) => void;
  /** 切换到亮色主题 */
  toggleLight: () => void;
  /** 切换到暗色主题 */
  toggleDark: () => void;
  /** 切换到系统主题 */
  toggleSystem: () => void;
  /** 初始化主题（根据系统偏好） */
  initTheme: () => void;
}

type ThemeStore = ThemeState & ThemeActions;

/**
 * 获取系统主题偏好
 *
 * @description 检查系统是否偏好暗色主题
 * @returns ResolvedTheme 解析后的主题
 */
const getSystemTheme = (): ResolvedTheme => {
  if (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    return "dark";
  }
  return "light";
};

/**
 * 应用主题到文档
 *
 * @description 将主题应用到 HTML 元素
 * @param resolvedTheme - 解析后的主题
 */
const applyTheme = (resolvedTheme: ResolvedTheme) => {
  if (typeof document !== "undefined") {
    document.documentElement.setAttribute("data-theme", resolvedTheme);
  }
};

/**
 * 主题状态管理 Store
 *
 * @description 使用 Zustand + persist 管理主题状态
 * 支持亮色、暗色和跟随系统三种模式
 */
export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      // ========== 初始状态 ==========

      /** 默认跟随系统主题 */
      theme: "system",

      /** 解析后的实际主题 */
      resolvedTheme: getSystemTheme(),

      // ========== 操作 ==========

      /**
       * 设置主题
       *
       * @param theme - 主题类型
       */
      setTheme: (theme: Theme) => {
        const resolvedTheme =
          theme === "system" ? getSystemTheme() : theme;
        applyTheme(resolvedTheme);
        set({ theme, resolvedTheme });
      },

      /**
       * 切换到亮色主题
       */
      toggleLight: () => {
        applyTheme("light");
        set({ theme: "light", resolvedTheme: "light" });
      },

      /**
       * 切换到暗色主题
       */
      toggleDark: () => {
        applyTheme("dark");
        set({ theme: "dark", resolvedTheme: "dark" });
      },

      /**
       * 切换到系统主题
       */
      toggleSystem: () => {
        const systemTheme = getSystemTheme();
        applyTheme(systemTheme);
        set({ theme: "system", resolvedTheme: systemTheme });
      },

      /**
       * 初始化主题
       *
       * @description 在应用启动时调用，同步主题状态和文档
       */
      initTheme: () => {
        const { theme } = get();
        const resolvedTheme =
          theme === "system" ? getSystemTheme() : theme;
        applyTheme(resolvedTheme);
        set({ resolvedTheme });

        // 监听系统主题变化
        if (typeof window !== "undefined") {
          window
            .matchMedia("(prefers-color-scheme: dark)")
            .addEventListener("change", (e) => {
              if (get().theme === "system") {
                const newTheme = e.matches ? "dark" : "light";
                applyTheme(newTheme);
                set({ resolvedTheme: newTheme });
              }
            });
        }
      },
    }),
    {
      /** 持久化存储的键名 */
      name: "piconote-theme",
      /** 部分持久化（resolvedTheme 由 theme 和系统决定） */
      partialize: (state) => ({ theme: state.theme }),
    }
  )
);