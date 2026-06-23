import { ImageResponse } from "next/og";

export const alt = "Syrian Business Gateway";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Default social-share card (sage brand). Text-only — Satori doesn't render emoji.
export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          background: "#4a6b4f",
          color: "#ffffff",
          padding: 90,
          justifyContent: "center",
        }}
      >
        <div style={{ fontSize: 30, letterSpacing: 2, opacity: 0.85 }}>SYRIAN BUSINESS GATEWAY</div>
        <div style={{ fontSize: 66, fontWeight: 700, marginTop: 28, lineHeight: 1.1 }}>
          Connecting Syrian producers with global buyers
        </div>
        <div style={{ fontSize: 30, opacity: 0.9, marginTop: 30 }}>
          Exporter directory · Import requests · Export readiness
        </div>
      </div>
    ),
    size,
  );
}
