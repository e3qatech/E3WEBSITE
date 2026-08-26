"use client";

import * as React from "react";
import { B2BGlobalFooter } from "./B2BGlobalFooter";
import { B2CGlobalFooter } from "./B2CGlobalFooter";

export interface FooterProps {
  portal: "b2c" | "b2b";
  settings?: Record<string, string>;
}

export function Footer({ portal, settings = {} }: FooterProps) {
  if (portal === "b2b") {
    return <B2BGlobalFooter settings={settings} />;
  }

  return <B2CGlobalFooter settings={settings} />;
}
