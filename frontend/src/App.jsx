import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { PenyediaAuth } from './konteks/KonteksAuth.jsx'
import RuteAplikasi from './rute/RuteAplikasi.jsx'

const klienQuery = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      retry: (jumlahGagal, galat) => {
        const status = galat?.response?.status
        if (status && status >= 400 && status < 500) return false
        return jumlahGagal < 1
      },
    },
  },
})

const OPSI_TOAST = {
  duration: 3500,
  style: {
    background: '#2B2118',
    color: '#FDFAE9',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: 600,
    maxWidth: '420px',
  },
  success: { iconTheme: { primary: '#D6F1E0', secondary: '#1B6B3A' } },
  error: { duration: 5000, iconTheme: { primary: '#FFD0CC', secondary: '#B3261E' } },
}

function App() {
  return (
    <QueryClientProvider client={klienQuery}>
      <BrowserRouter>
        <PenyediaAuth>
          <RuteAplikasi />
        </PenyediaAuth>
      </BrowserRouter>
      <Toaster position="top-center" toastOptions={OPSI_TOAST} />
    </QueryClientProvider>
  )
}

export default App
