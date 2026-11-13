import '@fontsource/fredoka/600.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import App from './App'
import './styles.css'
import './styles/layout.css'
import './styles/home.css'
import './styles/pages.css'
import './styles/auth.css'

/** Holds the app's data from the API (W2: who is signed in). No refetching on window focus: the session is kept
 *  fresh by auth/session.ts. */
const queryClient = new QueryClient({ defaultOptions: { queries: { refetchOnWindowFocus: false } } })

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
)
