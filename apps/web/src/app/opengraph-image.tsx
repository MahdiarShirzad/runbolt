import { ImageResponse } from "next/og";
import { OG_IMAGE_ALT, SITE_DESCRIPTION, SITE_NAME, SITE_TITLE, SITE_URL } from "@/lib/seo";

export const alt = OG_IMAGE_ALT;
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

const COLORS = {
  bg: "#0a0d13",
  surface: "#10151d",
  line: "#232c3b",
  fg: "#e9edf4",
  muted: "#8c97ab",
  volt: "#c7f04e",
};

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          backgroundColor: COLORS.bg,
          backgroundImage:
            "linear-gradient(to right, rgba(35, 44, 59, 0.35) 1px, transparent 1px), linear-gradient(to bottom, rgba(35, 44, 59, 0.35) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <svg width="72" height="72" viewBox="0 0 24 24">
            <path
              d="M13 2 L3 14 h7 l-1 8 L21 10 h-7 z"
              fill={COLORS.volt}
            />
          </svg>
          <div
            style={{
              marginLeft: 24,
              fontSize: 76,
              color: COLORS.fg,
              letterSpacing: "-0.03em",
            }}
          >
            {SITE_NAME}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 46, color: COLORS.volt }}>
            Automate workflows. Ship faster.
          </div>
          <div
            style={{
              marginTop: 24,
              width: 900,
              fontSize: 30,
              lineHeight: 1.4,
              color: COLORS.muted,
            }}
          >
            {SITE_DESCRIPTION}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 26,
            color: COLORS.muted,
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <div
              style={{
                width: 14,
                height: 14,
                marginRight: 16,
                backgroundColor: COLORS.volt,
              }}
            />
            {SITE_URL.replace("https://", "")}
          </div>
          <div style={{ fontSize: 24, color: "#5c6779" }}>{SITE_TITLE}</div>
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
