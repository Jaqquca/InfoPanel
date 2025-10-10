import React, { useContext, useEffect, useState } from 'react'
import { DataContext } from '../DataContext.js'

export default function AdminPage() {
  const { data, setData } = useContext(DataContext)
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('adminAuthenticated') === 'true'
  })
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const ADMIN_PASSWORD = 'Aa123456789'

  const handleLogin = (e) => {
    e.preventDefault()
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true)
      localStorage.setItem('adminAuthenticated', 'true')
      setError('')
      // Refresh page to ensure admin panel loads properly
      window.location.reload()
    } else {
      setError('Incorrect password')
      setPassword('')
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    localStorage.removeItem('adminAuthenticated')
    setPassword('')
    setError('')
    // Force re-render to show login screen
    window.location.reload()
  }

  if (!data) {
    return <div>Loading...</div>
  }

  if (!isAuthenticated) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          borderRadius: '16px',
          padding: '40px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          width: '100%',
          maxWidth: '400px',
          margin: '20px'
        }}>
          <h2 style={{ 
            color: 'white', 
            textAlign: 'center', 
            marginBottom: '30px',
            fontSize: '24px',
            fontWeight: '600'
          }}>
            Admin Access
          </h2>
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ 
                display: 'block', 
                color: 'white', 
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: '500'
              }}>
                Password:
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  fontSize: '16px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                autoFocus
              />
            </div>
            {error && (
              <div style={{ 
                color: '#ff6b6b', 
                fontSize: '14px', 
                marginBottom: '20px',
                textAlign: 'center'
              }}>
                {error}
              </div>
            )}
            <button
              type="submit"
              style={{
                width: '100%',
                padding: '12px',
                background: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.3)'
              }}
              onMouseOut={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.2)'
              }}
            >
              Access Admin Panel
            </button>
          </form>
        </div>
      </div>
    )
  }

  // Ensure timeBasedBackgrounds exists
  useEffect(() => {
    if (!data.timeBasedBackgrounds) {
      setData(prev => ({
        ...prev,
        timeBasedBackgrounds: [
          { startTime: "07:00", endTime: "11:00", image: "", label: "Morning" },
          { startTime: "11:00", endTime: "15:00", image: "", label: "Afternoon" },
          { startTime: "15:00", endTime: "19:00", image: "", label: "Evening" },
          { startTime: "19:00", endTime: "07:00", image: "", label: "Night" }
        ]
      }))
    }
  }, [data.timeBasedBackgrounds, setData])

  const handleBasicFieldChange = (field) => (e) => {
    setData(prev => ({ ...prev, [field]: e.target.value }))
  }


  const compressImage = (file, maxWidth = 800, quality = 0.7) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()
      
      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }
        
        canvas.width = width
        canvas.height = height
        
        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height)
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality)
        resolve(compressedDataUrl)
      }
      
      const reader = new FileReader()
      reader.onload = (e) => {
        img.src = e.target.result
      }
      reader.readAsDataURL(file)
    })
  }

  const handleBackgroundImageChange = async (e) => {
    const file = e.target.files[0]
    if (file) {
      try {
        const compressedImage = await compressImage(file)
        setData(prev => ({ ...prev, backgroundImage: compressedImage }))
      } catch (error) {
        console.error('Error compressing image:', error)
        // Fallback to original method
        const reader = new FileReader()
        reader.onload = (event) => {
          setData(prev => ({ ...prev, backgroundImage: event.target.result }))
        }
        reader.readAsDataURL(file)
      }
    }
  }

  const handleBackgroundImageUrl = (e) => {
    setData(prev => ({ ...prev, backgroundImage: e.target.value }))
  }

  const handleTimeBasedBackgroundChange = (index, field) => (e) => {
    setData(prev => {
      const timeBasedBackgrounds = [...prev.timeBasedBackgrounds]
      timeBasedBackgrounds[index] = { ...timeBasedBackgrounds[index], [field]: e.target.value }
      return { ...prev, timeBasedBackgrounds }
    })
  }

  const handleTimeBasedImageUpload = (index) => async (e) => {
    const file = e.target.files[0]
    if (file) {
      try {
        const compressedImage = await compressImage(file)
        setData(prev => {
          const timeBasedBackgrounds = [...prev.timeBasedBackgrounds]
          timeBasedBackgrounds[index] = { ...timeBasedBackgrounds[index], image: compressedImage }
          return { ...prev, timeBasedBackgrounds }
        })
      } catch (error) {
        console.error('Error compressing image:', error)
        // Fallback to original method
        const reader = new FileReader()
        reader.onload = (event) => {
          setData(prev => {
            const timeBasedBackgrounds = [...prev.timeBasedBackgrounds]
            timeBasedBackgrounds[index] = { ...timeBasedBackgrounds[index], image: event.target.result }
            return { ...prev, timeBasedBackgrounds }
          })
        }
        reader.readAsDataURL(file)
      }
    }
  }

  const addTimeSlot = () => {
    setData(prev => ({
      ...prev,
      timeBasedBackgrounds: [...prev.timeBasedBackgrounds, { startTime: "00:00", endTime: "00:00", image: "", label: "New Slot" }]
    }))
  }

  const removeTimeSlot = (index) => {
    setData(prev => ({
      ...prev,
      timeBasedBackgrounds: prev.timeBasedBackgrounds.filter((_, i) => i !== index)
    }))
  }

  const handleStatusChange = (e) => {
    setData(prev => ({ ...prev, status: e.target.value }))
  }

  const handleSlideChange = (index, field) => (e) => {
    setData(prev => {
      const slides = [...prev.slides]
      slides[index] = { ...slides[index], [field]: e.target.value }
      return { ...prev, slides }
    })
  }

  const removeSlide = (index) => {
    setData(prev => ({
      ...prev,
      slides: prev.slides.filter((_, i) => i !== index)
    }))
  }

  const addSlide = () => {
    setData(prev => ({
      ...prev,
      slides: [...prev.slides, { title: "", description: "", url: "", backgroundImage: "" }]
    }))
  }

  return (
    <div className="admin">
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '20px',
        paddingBottom: '20px',
        borderBottom: '1px solid #eee'
      }}>
        <h2>Admin</h2>
        <button
          onClick={handleLogout}
          style={{
            padding: '8px 16px',
            background: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}
          onMouseOver={(e) => {
            e.target.style.background = '#c82333'
          }}
          onMouseOut={(e) => {
            e.target.style.background = '#dc3545'
          }}
        >
          Logout
        </button>
      </div>
      
      {/* Background Color Settings */}
      <div className="admin-form">
        <h3>Background Color</h3>
        <div className="form-group">
          <label>Background Color (when no image):</label>
          <div style={{ 
            padding: '15px', 
            backgroundColor: '#f8f9fa', 
            border: '1px solid #dee2e6', 
            borderRadius: '4px',
            marginBottom: '10px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <span style={{ fontSize: '14px', fontWeight: 'bold' }}>Current Color:</span>
              <div 
                style={{ 
                  width: '30px', 
                  height: '30px', 
                  backgroundColor: '#f4a261', // Ghostly orange
                  border: '1px solid #ccc',
                  borderRadius: '4px'
                }}
              ></div>
              <span style={{ fontSize: '12px', color: '#666' }}>#f4a261 (Ghostly Orange)</span>
            </div>
            <p style={{ fontSize: '12px', color: '#666', margin: 0 }}>
              Background uses a ghostly (desaturated) version of the header color (#DE401A).
            </p>
          </div>
        </div>
      </div>

      {/* Formulář základních údajů */}
      <div className="admin-form">
        <h3>Základní údaje</h3>
        <div className="form-group">
          <label htmlFor="roomName">Název místnosti:</label>
          <input
            id="roomName"
            type="text"
            value={data.roomName}
            onChange={handleBasicFieldChange('roomName')}
          />
        </div>
        <div className="form-group">
          <label htmlFor="personName">Jméno osoby:</label>
          <input
            id="personName"
            type="text"
            value={data.personName}
            onChange={handleBasicFieldChange('personName')}
          />
        </div>
        <div className="form-group">
          <label htmlFor="roomType">Popis místnosti:</label>
          <input
            id="roomType"
            type="text"
            value={data.roomType}
            onChange={handleBasicFieldChange('roomType')}
          />
        </div>
      </div>

      {/* Přepínač stavu semaforu */}
      <div className="admin-form">
        <h3>Stav semaforu</h3>
        <div className="status-group">
          <button
            type="button"
            className={`status-button ${data.status === 'green' ? 'active' : ''}`}
            onClick={() => setData(prev => ({ ...prev, status: 'green' }))}
          >
            <span className="status-dot green"></span>
            <span className="status-label">Zelená</span>
          </button>
          <button
            type="button"
            className={`status-button ${data.status === 'red' ? 'active' : ''}`}
            onClick={() => setData(prev => ({ ...prev, status: 'red' }))}
          >
            <span className="status-dot red"></span>
            <span className="status-label">Červená</span>
          </button>
          <button
            type="button"
            className={`status-button ${data.status === 'orange' ? 'active' : ''}`}
            onClick={() => setData(prev => ({ ...prev, status: 'orange' }))}
          >
            <span className="status-dot orange"></span>
            <span className="status-label">Oranžová</span>
          </button>
        </div>
        <p><strong>Aktuální stav:</strong> 
          <span className={`status-indicator ${data.status}`}></span>
          {data.status}
        </p>
      </div>

      {/* Background Image Management */}
      <div className="admin-form">
        <h3>Background Settings</h3>
        

        {/* Background Image Options */}
        <div className="form-group">
          <label>Upload Background Image:</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleBackgroundImageChange}
            className="file-input"
          />
        </div>
        <div className="form-group">
          <label>Or enter image URL:</label>
          <input
            type="text"
            value={data.backgroundImage || ""}
            onChange={handleBackgroundImageUrl}
            placeholder="https://example.com/image.jpg"
          />
        </div>
        {data.backgroundImage && (
          <div className="background-preview">
            <p><strong>Current Background:</strong></p>
            <img 
              src={data.backgroundImage} 
              alt="Background preview" 
              className="preview-image"
            />
            <button 
              type="button" 
              className="remove-bg-btn"
              onClick={() => setData(prev => ({ ...prev, backgroundImage: "" }))}
            >
              Remove Static Background
            </button>
            <p style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
              <strong>Note:</strong> Static background overrides time-based backgrounds. 
              Remove it to enable automatic time-based switching.
            </p>
          </div>
        )}
      </div>

      {/* Time-based Background Images */}
      <div className="admin-form">
        <h3>Time-based Background Images</h3>
        <p>Set different backgrounds for different time periods</p>
        {(data.timeBasedBackgrounds || []).map((timeSlot, index) => (
          <div key={index} className="time-slot-form">
            <h4>Time Slot {index + 1}</h4>
            <div className="form-row">
              <div className="form-group">
                <label>Label:</label>
                <input
                  type="text"
                  value={timeSlot.label}
                  onChange={handleTimeBasedBackgroundChange(index, 'label')}
                  placeholder="Morning, Afternoon, etc."
                />
              </div>
              <div className="form-group">
                <label>Start Time:</label>
                <input
                  type="time"
                  value={timeSlot.startTime}
                  onChange={handleTimeBasedBackgroundChange(index, 'startTime')}
                />
              </div>
              <div className="form-group">
                <label>End Time:</label>
                <input
                  type="time"
                  value={timeSlot.endTime}
                  onChange={handleTimeBasedBackgroundChange(index, 'endTime')}
                />
              </div>
            </div>
            <div className="form-group">
              <label>Upload Image:</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleTimeBasedImageUpload(index)}
                className="file-input"
              />
            </div>
            <div className="form-group">
              <label>Or Image URL:</label>
              <input
                type="text"
                value={timeSlot.image || ""}
                onChange={handleTimeBasedBackgroundChange(index, 'image')}
                placeholder="https://example.com/image.jpg"
              />
            </div>
            {timeSlot.image && (
              <div className="time-slot-preview">
                <p><strong>Preview:</strong></p>
                <img 
                  src={timeSlot.image} 
                  alt={`${timeSlot.label} background`} 
                  className="preview-image"
                />
              </div>
            )}
            <button 
              type="button" 
              className="remove-btn"
              onClick={() => removeTimeSlot(index)}
            >
              Remove Time Slot
            </button>
          </div>
        ))}
        <button 
          type="button" 
          className="add-btn"
          onClick={addTimeSlot}
        >
          Add Time Slot
        </button>
      </div>


      {/* CRUD pro slidy */}
      <div className="admin-form">
        <h3>Správa slidů</h3>
        {data.slides.map((slide, i) => (
          <div key={i} className="slide-form">
            <h4>Slide {i + 1}</h4>
            <div className="form-group">
              <label>Název:</label>
              <input
                type="text"
                value={slide.title}
                onChange={handleSlideChange(i, 'title')}
              />
            </div>
            <div className="form-group">
              <label>Popis:</label>
              <input
                type="text"
                value={slide.description}
                onChange={handleSlideChange(i, 'description')}
              />
            </div>
            <div className="form-group">
              <label>URL:</label>
              <input
                type="text"
                value={slide.url}
                onChange={handleSlideChange(i, 'url')}
              />
            </div>
            <div className="form-group">
              <label>Background Image URL (GIF, JPG, PNG):</label>
              <input
                type="text"
                value={slide.backgroundImage || ""}
                onChange={handleSlideChange(i, 'backgroundImage')}
                placeholder="https://example.com/image.gif"
              />
            </div>
            <button 
              type="button" 
              className="remove-btn"
              onClick={() => removeSlide(i)}
            >
              Odstranit
            </button>
          </div>
        ))}
        <button 
          type="button" 
          className="add-btn"
          onClick={addSlide}
        >
          Přidat slide
        </button>
      </div>

      <p style={{ marginTop: 16 }}>
        <a href="/">← Zpět na obrazovku</a>
      </p>
    </div>
  )
}
