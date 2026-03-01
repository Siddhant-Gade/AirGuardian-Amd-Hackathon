/// <reference types="vite/client" />

/* Spline viewer web component — React 19 JSX type declaration */
import "react";
declare module "react/jsx-runtime" {
  namespace JSX {
    interface IntrinsicElements {
      "spline-viewer": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & { url?: string; loading?: string },
        HTMLElement
      >;
    }
  }
}
