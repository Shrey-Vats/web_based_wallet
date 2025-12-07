import { Keypair } from "@solana/web3.js";
import { generateMnemonic, mnemonicToSeedSync } from "bip39";
import { derivePath } from "ed25519-hd-key";
import { useState } from "react";
import nacl from "tweetnacl";
import { motion, AnimatePresence } from "framer-motion";
// Update this line
import { Copy, Eye, EyeOff, Plus, Trash2, ShieldCheck, Wallet, ChevronDown, ChevronUp } from "lucide-react";import bs58 from "bs58";
import { FaGithub, FaTwitter} from "react-icons/fa";

interface WalletData {
  publicKey: string;
  secretKey: string;
  path: string;
}

const Button = ({ onClick, children, variant = "primary", className = "", disabled = false }: any) => {
  const baseStyle = "px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 border border-transparent",
    secondary: "bg-zinc-800 text-zinc-300 border border-zinc-700 hover:bg-zinc-700 hover:text-white",
    ghost: "bg-transparent text-zinc-400 hover:text-white hover:bg-zinc-800/50",
    danger: "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20"
  };

  return (
    <button onClick={onClick} disabled={disabled} className={`${baseStyle} ${variants[variant as keyof typeof variants]} ${className}`}>
      {children}
    </button>
  );
};

const MnemonicGrid = ({ mnemonic }: { mnemonic: string }) => {
  const [isVisible, setIsVisible] = useState(false);
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(mnemonic);
    alert("Seed phrase copied to clipboard!"); // Replace with a toast in production
  };

  if (!mnemonic) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative w-full max-w-2xl bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-6 overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500" />
      
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-zinc-100 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          Secret Recovery Phrase
        </h2>
        <div className="flex gap-2">
            <Button variant="ghost" className="px-3 py-2 text-sm" onClick={() => setIsVisible(!isVisible)}>
                {isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
            <Button variant="ghost" className="px-3 py-2 text-sm" onClick={copyToClipboard}>
                <Copy className="w-4 h-4" />
            </Button>
        </div>
      </div>

      <div className={`grid grid-cols-3 sm:grid-cols-4 gap-3 relative ${!isVisible ? 'blur-sm select-none' : ''}`}>
        {mnemonic.split(" ").map((word, index) => (
          <div key={index} className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 flex items-center justify-between group-hover:border-zinc-700 transition-colors">
            <span className="text-zinc-500 text-xs font-mono select-none">{index + 1}</span>
            <span className="text-zinc-200 font-medium">{word}</span>
          </div>
        ))}
      </div>
      
      {!isVisible && (
         <div className="absolute inset-0 flex items-center justify-center z-10 cursor-pointer" onClick={() => setIsVisible(true)}>
            <div className="bg-zinc-900/90 border border-zinc-700 px-4 py-2 rounded-full flex items-center gap-2 text-sm text-zinc-300 hover:text-white transition-colors">
                <Eye className="w-4 h-4" /> Click to Reveal
            </div>
         </div>
      )}
    </motion.div>
  );
};

const WalletCard = ({ wallet, index }: { wallet: WalletData; index: number }) => {
  const [showSecret, setShowSecret] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    // Add toast notification logic here
  };

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-700 transition-all"
    >
        {/* Header / Public Key Preview */}
      <div className="p-4 flex items-center justify-between cursor-pointer bg-zinc-800/20" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 font-bold border border-zinc-700">
                {index + 1}
            </div>
            <div>
                <div className="text-lg font-bold text-white tracking-wide">Wallet {index + 1}</div>
                <div className="text-zinc-500 text-xs font-mono">Solana • Devnet</div>
            </div>
        </div>
        {isExpanded ? <ChevronUp className="text-zinc-500"/> : <ChevronDown className="text-zinc-500"/>}
      </div>

      <AnimatePresence>
        {isExpanded && (
            <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="border-t border-zinc-800"
            >
                <div className="p-5 space-y-4">
                    {/* Public Key */}
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Public Key</label>
                        <div 
                            onClick={() => copy(wallet.publicKey)}
                            className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 flex items-center justify-between cursor-pointer hover:border-indigo-500/50 transition-colors group"
                        >
                            <code className="text-sm text-zinc-300 truncate font-mono w-[90%]">{wallet.publicKey}</code>
                            <Copy className="w-4 h-4 text-zinc-600 group-hover:text-indigo-400" />
                        </div>
                    </div>

                    {/* Private Key */}
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider flex justify-between">
                            <span>Private Key</span>
                            <span className="text-red-400/80 text-[10px] flex items-center gap-1">
                                <ShieldCheck className="w-3 h-3" /> Never share this
                            </span>
                        </label>
                        <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 flex items-center justify-between group hover:border-red-900/50 transition-colors">
                            <div className="flex items-center gap-3 w-full overflow-hidden">
                                {showSecret ? (
                                    <code className="text-sm text-red-300/80 font-mono break-all">{wallet.secretKey}</code>
                                ) : (
                                    <div className="flex gap-1">
                                        {Array(8).fill(0).map((_, i) => (
                                            <span key={i} className="w-2 h-2 bg-zinc-700 rounded-full" />
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="flex gap-2 shrink-0 ml-2">
                                <button onClick={() => setShowSecret(!showSecret)} className="text-zinc-500 hover:text-zinc-300">
                                    {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                                <button onClick={() => copy(wallet.secretKey)} className="text-zinc-500 hover:text-zinc-300">
                                    <Copy className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const App = () => {
    const [mnemonic, setMnemonic] = useState("");
    const [wallets, setWallets] = useState<WalletData[]>([]);

    const handleGenerateMnemonic = async () => {
        const mn = await generateMnemonic();
        setMnemonic(mn);
        setWallets([]); 
    };

    const handleAddWallet = () => {
        if(!mnemonic) return;

        const seed = mnemonicToSeedSync(mnemonic);
        const path = `m/44'/501'/${wallets.length}'/0'`;
        const derivedSeed = derivePath(path, seed.toString("hex")).key;
        const secret = nacl.sign.keyPair.fromSeed(derivedSeed).secretKey;
        const keypair = Keypair.fromSecretKey(secret);
        
        const secretBase58 = bs58.encode(secret); 

        setWallets(prev => [...prev, {
            publicKey: keypair.publicKey.toBase58(),
            secretKey: secretBase58,
            path: path
        }]);
    };

    const handleClear = () => {
        setMnemonic("");
        setWallets([]);
    }

    return (
        <div className="min-h-screen bg-neutral-950 text-zinc-100 font-sans selection:bg-indigo-500/30">
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-900/20 rounded-full blur-[120px]" />
            </div>

            <main className="relative z-10 container mx-auto px-4 py-12 flex flex-col items-center gap-8 max-w-4xl">
                
                <div className="text-center space-y-4 mb-8">
                    <h1 className="text-5xl font-bold tracking-tighter bg-linear-to-br from-white to-zinc-500 bg-clip-text text-transparent">
                        Vault<span className="text-indigo-500">.</span>Gen
                    </h1>
                    <p className="text-zinc-400 text-lg max-w-md mx-auto">
                        Securely generate Solana wallets and seed phrases directly in your browser.
                    </p>
                </div>

                <div className="flex gap-4">
                    <Button onClick={handleGenerateMnemonic} variant={mnemonic ? "secondary" : "primary"}>
                        {mnemonic ? "Regenerate Phrase" : "Create Seed Phrase"}
                    </Button>
                    
                    {mnemonic && (
                        <Button onClick={handleAddWallet} variant="primary">
                            <Plus className="w-4 h-4" /> Add Wallet
                        </Button>
                    )}
                    
                    {mnemonic && (
                         <Button onClick={handleClear} variant="danger" className="px-3">
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    )}
                </div>

                {mnemonic && <MnemonicGrid mnemonic={mnemonic} />}

                <div className="w-full max-w-2xl space-y-4">
                    {wallets.length > 0 && (
                        <div className="flex items-center gap-2 text-zinc-500 text-sm font-medium mb-2 pl-2">
                             <Wallet className="w-4 h-4" /> YOUR WALLETS ({wallets.length})
                        </div>
                    )}
                    
                    <AnimatePresence>
                        {wallets.map((wallet, idx) => (
                            <WalletCard key={wallet.publicKey} wallet={wallet} index={idx} />
                        ))}
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
};

export default App;