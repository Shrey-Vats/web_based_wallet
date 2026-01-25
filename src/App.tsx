import { Navbar } from "./components/Navbar";
import { WalletGenerator } from "./components/WalletGenerator";
import { BackgroundTexture } from "./components/ui/background-texture";

function App() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans relative flex flex-col transition-colors duration-300">
      <BackgroundTexture />

      <Navbar />
      
      <main className="flex-1 relative z-10 flex flex-col">
        <WalletGenerator />
      </main>

      <footer className="py-8 text-center text-sm text-muted-foreground border-t border-dashed border-border/40 relative bg-background/50 backdrop-blur-sm z-10">
         <p>© 2026 Web3 Wallet. Secure, client-side only.</p>
      </footer>
    </div>
  );
}

export default App;
