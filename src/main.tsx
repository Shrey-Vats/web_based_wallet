import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { FaXTwitter } from 'react-icons/fa6'
import { FaGithub } from 'react-icons/fa'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />

<div className="mt-12 mb-6 flex flex-col items-center gap-4">
    <div className="flex items-center gap-6">
        <a 
            href="https://x.com/ShreyVats01" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-zinc-500 hover:text-white transition-colors duration-200"
        >
            <FaXTwitter className="w-5 h-5" />
        </a>
        <a 
            href="https://github.com/Shrey-Vats" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-zinc-500 hover:text-white transition-colors duration-200"
        >
            <FaGithub className="w-5 h-5" />
        </a>
    </div>
    <p className="text-zinc-600 text-sm font-medium">
        Created by <span className="text-zinc-300">Shrey Vats</span>
    </p>
</div>
  </StrictMode>,
  
)
