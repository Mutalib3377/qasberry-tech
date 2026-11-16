// lib/reading-help.ts
// "Reading help" preference: shows read-aloud (Listen) buttons and larger
// icons for young or pre-readers. On by default — every learner today is in
// the Kids & Teens track. Saved per device in localStorage; toggled from the
// user menu (components/shared/user-menu.tsx).
'use client'

import { useSyncExternalStore } from 'react'

const KEY = 'qasberry-reading-help'
const EVENT = 'qasberry:reading-help'

function read(): boolean {
  try {
    return localStorage.getItem(KEY) !== 'off'
  } catch {
    return true
  }
}

function subscribe(onChange: () => void) {
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) onChange()
  }
  window.addEventListener('storage', onStorage) // other tabs
  window.addEventListener(EVENT, onChange) // this tab
  return () => {
    window.removeEventListener('storage', onStorage)
    window.removeEventListener(EVENT, onChange)
  }
}

export function setReadingHelp(enabled: boolean) {
  try {
    localStorage.setItem(KEY, enabled ? 'on' : 'off')
  } catch {
    // Storage blocked — the choice just won't persist
  }
  window.dispatchEvent(new Event(EVENT))
}

/** True when Listen buttons and larger icons should show. Server render assumes on. */
export function useReadingHelp(): boolean {
  return useSyncExternalStore(subscribe, read, () => true)
}
