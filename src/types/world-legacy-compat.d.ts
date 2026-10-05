/**
 * Legacy WorldMapScreen compatibility: older UI code probes String#type before
 * falling back to the weather string. This is type-only; runtime strings are unchanged.
 */
declare global {
  interface String { readonly type?: string; }
}
export {};
