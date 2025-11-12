import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { UsuarioProvider } from './context/UsuarioContext.tsx'
import { CelulaProvider } from './context/CelulaContext.tsx'


createRoot(document.getElementById('root')!).render(
  <CelulaProvider>
      <UsuarioProvider>
        <StrictMode>
          <App />
      </StrictMode>
    </UsuarioProvider>
  </CelulaProvider>

  ,
)
