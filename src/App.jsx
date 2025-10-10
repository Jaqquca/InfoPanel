import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { DataContext, defaultData } from './DataContext.js'
import DisplayPage from './pages/DisplayPage.jsx'
import AdminPage from './pages/AdminPage.jsx'

export default function App() {
  // Start with default data, will be replaced by API or localStorage
  const [data, setData] = useState(defaultData)
  const isApplyingRemoteUpdate = useRef(false)
  const [isApiReady, setIsApiReady] = useState(false)
  const saveDebounceTimer = useRef(null)

  // Debounced localStorage save - waits 1 second after user stops typing
  useEffect(() => {
    // Skip debouncing for remote updates
    if (isApplyingRemoteUpdate.current) {
      try {
        const dataString = JSON.stringify(data)
        localStorage.setItem("roomPanelData", dataString)
        window.dispatchEvent(new CustomEvent('roomPanelDataChanged', { 
          detail: data 
        }))
      } catch (error) {
        console.warn("Chyba při ukládání do localStorage:", error)
      }
      return
    }

    // Clear existing timer
    if (saveDebounceTimer.current) {
      clearTimeout(saveDebounceTimer.current)
    }

    // Set new timer for debounced save
    saveDebounceTimer.current = setTimeout(() => {
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
    }, 500)

    // Cleanup on unmount
    return () => {
      if (saveDebounceTimer.current) {
        clearTimeout(saveDebounceTimer.current)
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
        console.warn('API not reachable, falling back to localStorage.', e)
        // Fallback to localStorage if API fails
        try {
          const saved = localStorage.getItem("roomPanelData")
          if (saved) {
            const localData = JSON.parse(saved)
            isApplyingRemoteUpdate.current = true
            setData(localData)
          }
        } catch (localError) {
          console.warn("Chyba při načítání z localStorage:", localError)
        }
        setIsApiReady(false)
      }
    }
    load()
    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Debounced API save - waits 1 second after user stops typing
  const apiDebounceTimer = useRef(null)
  useEffect(() => {
    if (!isApiReady) return
    if (isApplyingRemoteUpdate.current) {
      isApplyingRemoteUpdate.current = false
      return
    }

    // Clear existing timer
    if (apiDebounceTimer.current) {
      clearTimeout(apiDebounceTimer.current)
    }

    // Set new timer for debounced API call
    const controller = new AbortController()
    apiDebounceTimer.current = setTimeout(() => {
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
    }, 500)

    return () => {
      if (apiDebounceTimer.current) {
        clearTimeout(apiDebounceTimer.current)
      }
      controller.abort()
    }
  }, [data, isApiReady])

  // WebSocket connection for real-time updates
  useEffect(() => {
    if (!isApiReady) return
    
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const wsUrl = `${protocol}//${window.location.host}`
    const ws = new WebSocket(wsUrl)
    
    ws.onopen = () => {
      console.log('WebSocket connected for real-time updates')
    }
    
    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data)
        if (message.type === 'dataUpdate' && message.data) {
          isApplyingRemoteUpdate.current = true
          setData(message.data)
        }
      } catch (e) {
        console.warn('Invalid WebSocket message:', e)
      }
    }
    
    ws.onclose = () => {
      console.log('WebSocket disconnected, attempting reconnect in 3s...')
      setTimeout(() => {
        if (isApiReady) {
          // Trigger reconnection by re-running this effect
          setData(prev => ({ ...prev }))
        }
      }, 3000)
    }
    
    ws.onerror = (error) => {
      console.warn('WebSocket error:', error)
    }
    
    return () => {
      ws.close()
    }
  }, [isApiReady])

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
