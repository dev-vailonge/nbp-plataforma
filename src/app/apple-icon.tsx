import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#2A2926",
          borderRadius: 40,
        }}
      >
        <div
          style={{
            width: 96,
            height: 96,
            background: "#C6CABE",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: 60,
              height: 60,
              borderRadius: 999,
              background: "#2A2926",
            }}
          />
        </div>
      </div>
    ),
    { ...size },
  );
}
