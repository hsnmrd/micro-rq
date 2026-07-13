"use client";

import { useSyncExternalStore } from "react";

const progressById = new Map<string, number>();
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) {
    listener();
  }
}

export function setUploadProgress(id: string, progress: number) {
  progressById.set(id, progress);
  emit();
}

export function resetUploadProgress(id: string) {
  progressById.set(id, 0);
  emit();
}

export function useUploadProgress(id: string) {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);

      return () => {
        listeners.delete(listener);
      };
    },
    () => progressById.get(id) ?? 0,
    () => 0,
  );
}
