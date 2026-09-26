import type { ReactNode } from "react";
import "./pixel-frame.css";

export function PixelFrame({ children }: { children: ReactNode }) {
  return (
    <div className="venus-pixel">
      <div className="mockframe pixel10 porcelain">
        <div className="sleep" aria-hidden="true" />
        <div className="volume" aria-hidden="true" />
        <div className="camera" aria-hidden="true" />
        <div className="screen">{children}</div>
      </div>
    </div>
  );
}
