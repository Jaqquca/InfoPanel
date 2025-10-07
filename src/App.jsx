import React, { useEffect, useMemo, useRef, useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { DataContext, defaultData } from './DataContext.js'
import DisplayPage from './pages/DisplayPage.jsx'
import AdminPage from './pages/AdminPage.jsx'

export default function App() {
  // Načti z localStorage, pokud existuje
  const [data, setData] = useState(() => {
    try {
      const saved = localStorage.getItem("roomPanelData")
      return saved ? JSON.parse(saved) : defaultData
    } catch (error) {
      console.warn("Chyba při načítání z localStorage:", error)
      return defaultData
    }
  })
  const isApplyingRemoteUpdate = useRef(false)
  const [isApiReady, setIsApiReady] = useState(false)

  // Persistuj do localStorage při změně dat
  useEffect(() => {
    try {
      const dataString = JSON.stringify(data)
      const dataSize = new Blob([dataString]).size
      const maxSize = 5 * 1024 * 1024 // 5MB limit
      
      if (dataSize > maxSize) {
        console.warn(`Data size (${Math.round(dataSize / 1024)}KB) is approaching localStorage limit. Consider using smaller images.`)
      }
      
      localStorage.setItem("roomPanelData", dataString)
      // Vyvolej custom event pro real-time aktualizace v rámci stejné záložky
      window.dispatchEvent(new CustomEvent('roomPanelDataChanged', { 
        detail: data 
      }))
    } catch (error) {
      console.warn("Chyba při ukládání do localStorage:", error)
      if (error.name === 'QuotaExceededError') {
        alert('Storage limit exceeded. Please use smaller images or remove some backgrounds.')
      }
    }
  }, [data])

  // Načti data z API při startu (a inicializuj, pokud prázdné)
  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const res = await fetch('/api/data')
        if (!res.ok) throw new Error('Failed to fetch /api/data')
        const payload = await res.json()
        if (cancelled) return
        if (payload && payload.data) {
          isApplyingRemoteUpdate.current = true
          setData(payload.data)
        } else {
          // Inicializuj vzdálené úložiště aktuálními (lokálními) daty
          await fetch('/api/data', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          })
        }
        setIsApiReady(true)
      } catch (e) {
        console.warn('API not reachable, working from localStorage only.', e)
        setIsApiReady(false)
      }
    }
    load()
    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Odesílej změny do API (vynech při aplikaci vzdálené aktualizace)
  useEffect(() => {
    if (!isApiReady) return
    if (isApplyingRemoteUpdate.current) {
      isApplyingRemoteUpdate.current = false
      return
    }
    const controller = new AbortController()
    const send = async () => {
      try {
        await fetch('/api/data', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
          signal: controller.signal,
        })
      } catch (e) {
        if (e.name !== 'AbortError') console.warn('Failed to PUT /api/data', e)
      }
    }
    send()
    return () => controller.abort()
  }, [data, isApiReady])

  // Pravidelné dotazování API pro změny z jiných zařízení
  useEffect(() => {
    if (!isApiReady) return
    let cancelled = false
    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/data', { cache: 'no-store' })
        if (!res.ok) return
        const payload = await res.json()
        if (cancelled) return
        if (payload && payload.data) {
          const localStr = JSON.stringify(data)
          const remoteStr = JSON.stringify(payload.data)
          if (localStr !== remoteStr) {
            isApplyingRemoteUpdate.current = true
            setData(payload.data)
          }
        }
      } catch (e) {
        // silently ignore during polling
      }
    }, 5000) // 5s
    return () => { cancelled = true; clearInterval(interval) }
  }, [data, isApiReady])

  // Naslouchej změnám v localStorage pro real-time aktualizace mezi záložkami
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "roomPanelData" && e.newValue) {
        try {
          const newData = JSON.parse(e.newValue)
          setData(newData)
        } catch (error) {
          console.warn("Chyba při načítání dat z localStorage:", error)
        }
      }
    }

    // Naslouchej custom event pro aktualizace v rámci stejné záložky
    const handleCustomDataChange = (e) => {
      setData(e.detail)
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('roomPanelDataChanged', handleCustomDataChange)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('roomPanelDataChanged', handleCustomDataChange)
    }
  }, [])

  const ctxValue = useMemo(() => ({ data, setData }), [data])

  return (
    <DataContext.Provider value={ctxValue}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<DisplayPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </BrowserRouter>
    </DataContext.Provider>
  )
}
