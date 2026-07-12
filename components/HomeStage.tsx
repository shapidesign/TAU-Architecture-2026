"use client";

import { useState } from "react";
import IntroBox from "./IntroBox";

/**
 * Holds the intro overlay and, once it finishes, flips the `.go` class that
 * lets the letter cubes pop into the revealed page one by one.
 */
export default function HomeStage({ children }: { children: React.ReactNode }) {
  const [go, setGo] = useState(false);
  return (
    <>
      <IntroBox onDone={() => setGo(true)} />
      <div className={`poster-stage ${go ? "go" : ""}`}>{children}</div>
    </>
  );
}
