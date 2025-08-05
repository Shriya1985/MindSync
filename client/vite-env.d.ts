/// <reference types="vite/client" />

// Extend HTMLElement to include React root property for safe mounting
declare global {
  interface HTMLElement {
    _reactRoot?: import("react-dom/client").Root;
  }
}
