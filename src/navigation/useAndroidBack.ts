import { useEffect, useRef } from 'react'
import { App } from '@capacitor/app'
import { Capacitor } from '@capacitor/core'

export function useAndroidBack(onBack: () => void) {
  const callback = useRef(onBack)
  callback.current = onBack
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return
    const listener = App.addListener('backButton', () => callback.current())
    return () => { void listener.then(handle => handle.remove()) }
  }, [])
}
