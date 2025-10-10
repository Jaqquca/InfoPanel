import React, { useContext, useMemo, useState, useEffect } from 'react'
import { DataContext } from '../DataContext.js'
import QRCode from 'react-qr-code'

export default function DisplayPage() {
  const { data } = useContext(DataContext)

  const slides = data?.slides ?? []
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [isColorTransitioning, setIsColorTransitioning] = useState(false)
  const [previousStatus, setPreviousStatus] = useState(data?.status || 'orange')
  const [currentBackground, setCurrentBackground] = useState(data?.backgroundImage || "")

  // Automatická rotace slidů každých 15 sekund
  useEffect(() => {
    if (slides.length > 0) {
      const interval = setInterval(() => {
        setIsTransitioning(true)
        setTimeout(() => {
          setCurrentSlide(prev => (prev + 1) % slides.length)
          setIsTransitioning(false)
        }, 750) // Half of transition duration
      }, 15000)
      return () => clearInterval(interval)
    }
  }, [slides])


  // Breathing effect when color changes
  useEffect(() => {
    if (data?.status && data.status !== previousStatus) {
      setIsColorTransitioning(true)
      setTimeout(() => {
        setPreviousStatus(data.status)
        setIsColorTransitioning(false)
      }, 1000) // Transition duration
    }
  }, [data?.status, previousStatus])

  // Time-based background switching
  useEffect(() => {
    const getCurrentBackground = () => {
      // If static background is set, use it (manual override)
      if (data?.backgroundImage) {
        return data.backgroundImage
      }
      
      // Otherwise, check time-based backgrounds
      const now = new Date()
      const currentTime = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0')
      
      if (data?.timeBasedBackgrounds && data.timeBasedBackgrounds.length > 0) {
        for (const timeSlot of data.timeBasedBackgrounds) {
          if (timeSlot.image && isTimeInRange(currentTime, timeSlot.startTime, timeSlot.endTime)) {
            return timeSlot.image
          }
        }
      }
      
      return ""
    }

    const isTimeInRange = (current, start, end) => {
      const currentMinutes = timeToMinutes(current)
      const startMinutes = timeToMinutes(start)
      const endMinutes = timeToMinutes(end)
      
      // Handle overnight periods (e.g., 19:00 to 07:00)
      if (startMinutes > endMinutes) {
        return currentMinutes >= startMinutes || currentMinutes < endMinutes
      }
      
      return currentMinutes >= startMinutes && currentMinutes < endMinutes
    }

    const timeToMinutes = (time) => {
      const [hours, minutes] = time.split(':').map(Number)
      return hours * 60 + minutes
    }

    const newBackground = getCurrentBackground()
    setCurrentBackground(newBackground)
    
    // Check every minute for time-based changes
    const interval = setInterval(() => {
      const newBackground = getCurrentBackground()
      setCurrentBackground(newBackground)
    }, 60000) // Check every minute

    return () => clearInterval(interval)
  }, [data?.timeBasedBackgrounds, data?.backgroundImage])

  const statusClass = useMemo(() => {
    const s = (data?.status || 'orange').toLowerCase()
    return ['green', 'red', 'orange'].includes(s) ? s : 'orange'
  }, [data?.status])

  const slide = slides[currentSlide]

  return (
    <div className="layout">
      <div 
        className="background-overlay"
        style={{
          backgroundImage: currentBackground ? `url(${currentBackground})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      ></div>
      <header className="top">
        <div className="header-left">
          <h1 className="room-name">{data?.roomName ?? 'Místnost'}</h1>
          <p className="room-meta">
            {data?.personName ?? '—'} — {data?.roomType ?? '—'}
          </p>
        </div>
        <div className="header-status">
          {statusClass === 'red' && 'NEVSTUPOVAT'}
          {statusClass === 'orange' && 'ZANEPRÁZDNĚNO'}
          {statusClass === 'green' && 'VOLNO'}
        </div>
      </header>

      <main 
        className={`middle ${currentBackground ? 'has-background' : ''}`}
        style={{ backgroundColor: !currentBackground ? (data?.backgroundColor || '#e5e7eb') : 'transparent' }}
      >
        <div className={`light ${statusClass} ${isColorTransitioning ? 'color-transitioning' : ''}`} aria-label={`Stav: ${statusClass}`} />
      </main>

      <footer 
        className={`bottom ${currentBackground ? 'has-background' : ''}`}
        style={{ backgroundColor: !currentBackground ? (data?.backgroundColor || '#e5e7eb') : 'transparent' }}
      >
        <div className="slides">
          {slide ? (
            <div className={`slide-container ${isTransitioning ? 'transitioning' : ''}`}>
              <div 
                className="slide glass-effect"
                style={{
                  backgroundImage: slide.backgroundImage ? `url(${slide.backgroundImage})` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat'
                }}
              >
                <div className="slide-content">
                  <div className="slide-text">
                    <h3>{slide.title}</h3>
                    <p>{slide.description}</p>
                  </div>
                  <div className="qr">
                    <QRCode value={slide.url} size={130} />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p className="empty">Žádné slidy</p>
          )}
        </div>
      </footer>
    </div>
  )
}
