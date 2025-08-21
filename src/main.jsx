import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
window.supabase = createClient(
  'https://dbsmyvuoatkjmputipjr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRic215dnVvYXRram1wdXRpcGpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1ODQ2NDgsImV4cCI6MjA3MDE2MDY0OH0.LezNqOJL5weBTI_HnxmnEo3WJ5TlbB1SZ2z-Kde_Wbs'
)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)