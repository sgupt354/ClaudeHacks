import { useEffect, useState } from "react";

export default function Toast({ message, type = "success", onDone }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => { setVisible(false); setTimeout(onDone, 300); }, 2000);
    return () => clearTimeout(t);
  }, []);

  const bg = type === "success" ? "#22c55e" : "#1e293b";

  return (
    <div style={{
      position: "fixed", bottom: 32, left: "50%", transform: "translateX(-50%)",
      background: bg, color: "white", padding: "10px 20px", borderRadius: 999,
      fontSize: 14, fontWeight: 600, zIndex: 9999, whiteSpace: "nowrap",
      boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
      animation: visible ? "fadeInUp 0.25s ease" : "fadeOut 0.3s ease forwards",
      pointerEvents: "none",
    }}>
      {message}
    </div>
  );
}
