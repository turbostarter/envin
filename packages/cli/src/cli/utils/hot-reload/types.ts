import type { EventName } from "chokidar/handler.js";

export type HotReloadEvent = EventName;

export interface HotReloadChange {
  filename: string;
  event: HotReloadEvent;
}
