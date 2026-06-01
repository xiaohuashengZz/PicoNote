import { useEffect } from "react";
import ThreeColumnLayout from "./components/Layout/ThreeColumnLayout";
import GlobalSearch from "./components/Search/GlobalSearch";
import Settings from "./components/Settings/Settings";
import { useThemeStore } from "./stores/themeStore";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
import "./App.css";

export default function App() {
  const { initTheme } = useThemeStore();

  useEffect(() => {
    initTheme();
  }, [initTheme]);

  useKeyboardShortcuts();

  return (
    <div className="app">
      <main className="app-main">
        <ThreeColumnLayout />
      </main>

      <GlobalSearch />

      <Settings />
    </div>
  );
}
