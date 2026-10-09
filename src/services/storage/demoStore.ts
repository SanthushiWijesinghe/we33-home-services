export function readDemoValue<T>(key: string, fallback: T): T {
  try {
    const saved = localStorage.getItem(key)
    return saved ? (JSON.parse(saved) as T) : fallback
  } catch {
    return fallback
  }
}

export function writeDemoValue<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value))
}
