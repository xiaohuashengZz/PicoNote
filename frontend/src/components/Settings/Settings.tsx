import { useUIStore } from "../../stores/uiStore";
import { useThemeStore, type Theme } from "../../stores/themeStore";
import "./Settings.css";

const THEME_OPTIONS: { value: Theme; label: string; icon: string }[] = [
  { value: "light", label: "亮色模式", icon: "☀️" },
  { value: "dark", label: "暗色模式", icon: "🌙" },
  { value: "system", label: "跟随系统", icon: "💻" },
];

export default function Settings() {
  const { isSettingsOpen, closeSettings } = useUIStore();
  const { theme, setTheme } = useThemeStore();

  if (!isSettingsOpen) return null;

  return (
    <div className="settings-overlay" onClick={closeSettings}>
      <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <h2>设置</h2>
          <button className="settings-close" onClick={closeSettings}>
            &times;
          </button>
        </div>

        <div className="settings-body">
          {/* 主题设置 */}
          <div className="settings-section">
            <h3 className="settings-section-title">外观</h3>
            <div className="settings-option">
              <label>主题</label>
              <div className="theme-options">
                {THEME_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    className={`theme-option-btn ${theme === opt.value ? "active" : ""}`}
                    onClick={() => setTheme(opt.value)}
                  >
                    <span>{opt.icon}</span>
                    <span>{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 关于 */}
          <div className="settings-section">
            <h3 className="settings-section-title">关于</h3>
            <div className="settings-about">
              <p>PicoNote v0.1.0</p>
              <p className="settings-about-desc">一款轻量级桌面笔记应用</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
