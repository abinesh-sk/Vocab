import React from 'react'
import { AppProvider } from './hooks/useApp'
import Layout from './components/Layout'
import Toast from './components/Toast'

export default function App() {
  return (
    <AppProvider>
      <Layout />
      <Toast />
    </AppProvider>
  )
}
