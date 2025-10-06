import React, { useEffect, useMemo, useState } from 'react'
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
