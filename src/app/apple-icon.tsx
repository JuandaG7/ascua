import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#1E3A2F" }}>
        <svg viewBox="0 0 512 512" width="180" height="180">
          <path d="M96 352c56-26 108-26 160 0s104 26 160 0" fill="none" stroke="#7FBFAA" strokeWidth="22" strokeLinecap="round" />
          <path d="M256 104c34 46 76 78 76 132a76 76 0 0 1-152 0c0-32 18-52 34-70 4 26 18 40 34 44-10-40 0-74 8-106z" fill="#E89A7C" />
          <circle cx="256" cy="250" r="26" fill="#E2BC8E" />
        </svg>
      </div>
    ),
    size,
  );
}
