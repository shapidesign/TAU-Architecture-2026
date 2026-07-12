import type { CSSProperties, ReactNode } from "react";

/** Flat-poster-style CSS 3D cube. Size via --s in `style`. */
export default function Cube({
  content,
  front,
  inner,
  className = "",
  style,
}: {
  content?: ReactNode;
  front?: ReactNode; // overrides content on the front face (the "lid")
  inner?: ReactNode; // face just behind the lid, shown when the lid opens
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div className={`cube ${className}`} style={style}>
      {inner !== undefined && <div className="face f-front f-inner">{inner}</div>}
      <div className="face f-front f-lid">{front ?? content}</div>
      <div className="face f-back">{content}</div>
      <div className="face f-right">{content}</div>
      <div className="face f-left">{content}</div>
      <div className="face f-top">{content}</div>
      <div className="face f-bottom" />
    </div>
  );
}

/** The poster's arrow-up glyph used for the letter I. */
export function ArrowGlyph({ size = "55%" }: { size?: string }) {
  return (
    <svg
      viewBox="0 0 40 64"
      style={{ height: size }}
      aria-hidden
      className="fill-[var(--ink,#111)]"
    >
      <polygon points="20,0 40,22 27,22 27,64 13,64 13,22 0,22" />
    </svg>
  );
}
