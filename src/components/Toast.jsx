import React from 'react'
import { useApp } from '../hooks/useApp'

export default function Toast() {
  const { notification } = useApp()
  if (!notification) return null

  const colors = {
    success: { bg: 'var(--sage)', border: '#5A7A4A' },
    error: { bg: 'var(--rust)', border: '#9E4420' },
    info: { bg: 'var(--brown)', border: 'var(--brown-dark)' },
  }
  const c = colors[notification.type] || colors.success

  return (
    <div style={{
      position: 'fixed', bottom: 32, right: 32, zIndex: 9999,
      background: c.bg,
      border: `1px solid ${c.border}`,
      color: 'white',
      padding: '12px 20px',
      borderRadius: 10,
      fontFamily: 'DM Sans, sans-serif',
      fontSize: 14,
      fontWeight: 500,
      boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
      animation: 'fadeIn 0.3s ease',
      maxWidth: 360,
    }}>
      {notification.message}
    </div>
  )
}
