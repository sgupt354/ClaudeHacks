import "../styles/globals.css";
import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Footer from "../components/Footer";
import OnboardingModal from "../components/OnboardingModal";

export const ThemeContext = createContext({ theme: "light", toggleTheme: () => {} });
export const useTheme = () => useContext(ThemeContext);

export default function App({ Component, pageProps }) {
  const [theme, setTheme] = useState("light");
  const router = useRouter();

  useEffect(() => {
    const saved = localStorage.getItem("theme") || "light";
    setTheme(saved);
    document.documentElement.setAttribute("data-theme", saved);
    // Register service worker for PWA offline support
    if ("serviceWorker" in navigator) {
      // Unregister all old service workers first, then register fresh
      navigator.serviceWorker.getRegistrations().then((regs) => {
        Promise.all(regs.map((r) => r.unregister())).then(() => {
          navigator.serviceWorker.register("/sw.js").catch(() => {});
        });
      });
    }
  }, []);

  // Global keyboard shortcuts
  useEffect(() => {
    function onKey(e) {
      const tag = e.target.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || e.target.isContentEditable) return;
      if (e.key === "n" || e.key === "N") router.push("/compose");
      if (e.key === "m" || e.key === "M") router.push("/map");
      if (e.key === "f" || e.key === "F") router.push("/forum");
      if (e.key === "/") {
        // Focus search bar on forum page
        const search = document.querySelector("input[placeholder='Search issues...']");
        if (search) { e.preventDefault(); search.focus(); }
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [router]);

  function toggleTheme() {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    localStorage.setItem("theme", next);
    document.documentElement.setAttribute("data-theme", next);
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <Head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#2563eb" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Civilian" />
      </Head>
      <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <div style={{ flex: 1 }}>
          <Component {...pageProps} />
        </div>
        <Footer />
      </div>
      <OnboardingModal />
    </ThemeContext.Provider>
  );
}
