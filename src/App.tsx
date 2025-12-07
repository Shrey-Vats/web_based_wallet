import { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { generateMnemonic, mnemonicToSeedSync, validateMnemonic } from "bip39";
import { derivePath } from "ed25519-hd-key";
import { useState, useEffect } from "react";
import nacl from "tweetnacl";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCw, Copy, Eye, EyeOff, Plus, Trash2, ShieldCheck, Wallet, ChevronDown, ChevronUp, Download, X } from "lucide-react";
import { FaGithub, FaXTwitter } from "react-icons/fa6";
import bs58 from "bs58";

interface WalletData {
  publicKey: PublicKey;
  secretKey: string;
  path: string;
}

const Button = ({ onClick, children, variant = "primary", className = "", disabled = false }: any) => {
  const baseStyle = "px-5 py-2.5 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-sm";
  const variants = {
    primary: "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 border border-transparent hover:-translate-y-0.5",
    secondary: "bg-zinc-800 text-zinc-300 border border-zinc-700 hover:bg-zinc-700 hover:text-white hover:border-zinc-600",
    ghost: "bg-transparent text-zinc-400 hover:text-white hover:bg-zinc-800/50",
    danger: "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 hover:border-red-500/40"
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
  };

  if (!mnemonic) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative w-full max-w-2xl bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-6 overflow-hidden mb-8"
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500" />
      
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-zinc-100 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          Secret Recovery Phrase
        </h2>
        <div className="flex gap-2">
            <Button variant="ghost" className="px-3 py-2 text-xs" onClick={() => setIsVisible(!isVisible)}>
                {isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
            <Button variant="ghost" className="px-3 py-2 text-xs" onClick={copyToClipboard}>
                <Copy className="w-4 h-4" />
            </Button>
        </div>
      </div>

      <div className={`grid grid-cols-3 sm:grid-cols-4 gap-3 relative transition-all duration-500 ${!isVisible ? 'blur-md select-none grayscale' : 'blur-0'}`}>
        {mnemonic.split(" ").map((word, index) => (
          <div key={index} className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 flex items-center justify-between group-hover:border-zinc-700 transition-colors">
            <span className="text-zinc-600 text-xs font-mono select-none">{index + 1}</span>
            <span className="text-zinc-200 font-medium">{word}</span>
          </div>
        ))}
      </div>
      
      {!isVisible && (
         <div className="absolute inset-0 flex items-center justify-center z-10 cursor-pointer" onClick={() => setIsVisible(true)}>
            <div className="bg-zinc-900/90 border border-zinc-700 px-5 py-3 rounded-full flex items-center gap-2 text-sm text-zinc-300 hover:text-white transition-all shadow-xl hover:scale-105">
                <Eye className="w-4 h-4" /> Tap to Reveal Phrase
            </div>
         </div>
      )}
    </motion.div>
  );
};

const WalletCard = ({ wallet, index }: { wallet: WalletData; index: number }) => {
  const [showSecret, setShowSecret] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  useEffect(() => {
    fetchBalance();
  }, []);

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const fetchBalance = async () => {
    setIsRefreshing(true);
    try {
        const connection = new Connection("https://api.devnet.solana.com");
        const lamports = await connection.getBalance(wallet.publicKey);
        setBalance(lamports / LAMPORTS_PER_SOL);
    } catch (error) {
        console.error("Failed to fetch balance", error);
    } finally {
        setIsRefreshing(false);
    }
  };

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-700 transition-all"
    >
      <div className="p-4 flex items-center justify-between cursor-pointer bg-zinc-800/20 hover:bg-zinc-800/40 transition-colors" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-linear-to-br from-zinc-800 to-zinc-900 flex items-center justify-center text-zinc-400 font-bold border border-zinc-700 shadow-inner">
                {index + 1}
            </div>
            <div>
                <div className="text-base font-bold text-white tracking-wide">Wallet {index + 1}</div>
                <div className="text-zinc-500 text-xs font-mono flex items-center gap-2">
                    Solana <span className="w-1 h-1 rounded-full bg-zinc-600"></span> Devnet
                </div>
            </div>
        </div>
        <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
                <div className="text-sm font-medium text-white">
                    {balance !== null ? `${balance.toFixed(4)} SOL` : "---"}
                </div>
            </div>
            {isExpanded ? <ChevronUp className="text-zinc-500 w-5 h-5"/> : <ChevronDown className="text-zinc-500 w-5 h-5"/>}
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
            <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="border-t border-zinc-800"
            >
                <div className="p-5 space-y-5">
                    
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider ml-1">Native Balance</label>
                        <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 flex items-center justify-between">
                            <div className="text-sm text-zinc-300 font-mono">
                                {balance !== null ? (
                                    <span className="text-white font-medium">{balance} SOL</span>
                                ) : (
                                    <span className="text-zinc-600">Loading...</span>
                                )}
                            </div>
                            <button 
                                onClick={fetchBalance}
                                disabled={isRefreshing}
                                className="p-2 hover:bg-zinc-800 rounded-md transition-colors disabled:opacity-50"
                            >
                                <RotateCw className={`w-4 h-4 text-indigo-400 ${isRefreshing ? "animate-spin" : ""}`} />
                            </button>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider ml-1">Public Key</label>
                        <div 
                            onClick={() => copy(wallet.publicKey.toString())}
                            className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 flex items-center justify-between cursor-pointer hover:border-indigo-500/30 transition-colors group"
                        >
                            <code className="text-sm text-zinc-300 truncate font-mono w-[85%]">{wallet.publicKey.toBase58()}</code>
                            <Copy className="w-4 h-4 text-zinc-600 group-hover:text-indigo-400 transition-colors" />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider flex justify-between ml-1">
                            <span>Private Key</span>
                            <span className="text-red-400/80 text-[10px] flex items-center gap-1 bg-red-500/10 px-2 py-0.5 rounded-full">
                                <ShieldCheck className="w-3 h-3" /> DO NOT SHARE
                            </span>
                        </label>
                        <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 flex items-center justify-between group hover:border-red-900/30 transition-colors">
                            <div className="flex items-center gap-3 w-full overflow-hidden">
                                {showSecret ? (
                                    <code className="text-sm text-red-300/80 font-mono break-all">{wallet.secretKey}</code>
                                ) : (
                                    <div className="flex gap-1.5 h-5 items-center">
                                        {Array(12).fill(0).map((_, i) => (
                                            <span key={i} className="w-1.5 h-1.5 bg-zinc-700 rounded-full" />
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="flex gap-2 shrink-0 ml-2">
                                <button onClick={() => setShowSecret(!showSecret)} className="p-1.5 hover:bg-zinc-800 rounded-md text-zinc-500 hover:text-zinc-300 transition-colors">
                                    {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                                <button onClick={() => copy(wallet.secretKey)} className="p-1.5 hover:bg-zinc-800 rounded-md text-zinc-500 hover:text-zinc-300 transition-colors">
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
    const [isLoading, setIsLoading] = useState<boolean>(false);
    
    const [isImporting, setIsImporting] = useState<boolean>(false);
    const [importInput, setImportInput] = useState<string>("");
    const [importError, setImportError] = useState<string>("");

    const handleGenerateMnemonic = async () => {
        const mn = await generateMnemonic();
        setMnemonic(mn);
        setWallets([]); 
        setIsImporting(false);
    };

    const handleImportMnemonic = () => {
        setImportError("");
        if (!validateMnemonic(importInput.trim())) {
            setImportError("Invalid seed phrase. Please check your words.");
            return;
        }
        setMnemonic(importInput.trim());
        setWallets([]);
        setIsImporting(false);
        setImportInput("");
    };

    const handleAddWallet = async () => {
        if(!mnemonic) return;
        setIsLoading(true)

        await new Promise(resolve => setTimeout(resolve, 300));

        const seed = mnemonicToSeedSync(mnemonic);
        const path = `m/44'/501'/${wallets.length}'/0'`;
        const derivedSeed = derivePath(path, seed.toString("hex")).key;
        const secret = nacl.sign.keyPair.fromSeed(derivedSeed).secretKey;
        const keypair = Keypair.fromSecretKey(secret);
        
        const secretBase58 = bs58.encode(secret); 

        setWallets(prev => [...prev, {
            publicKey: keypair.publicKey,
            secretKey: secretBase58,
            path: path,
        }]);

        setIsLoading(false);
    };

    const handleClear = () => {
        setMnemonic("");
        setWallets([]);
        setImportInput("");
    }

    return (
        <div className="min-h-screen bg-neutral-950 text-zinc-100 font-sans selection:bg-indigo-500/30 pb-20">
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-900/10 rounded-full blur-[120px]" />
            </div>

            <main className="relative z-10 container mx-auto px-4 py-16 flex flex-col items-center gap-6 max-w-4xl">

                <div className="text-center space-y-4 mb-8">
                    <h1 className="text-5xl md:text-6xl font-bold tracking-tighter bg-linear-to-br from-white to-zinc-500 bg-clip-text text-transparent">
                        Vault<span className="text-indigo-500">.</span>Gen
                    </h1>
                    <p className="text-zinc-400 text-lg max-w-md mx-auto leading-relaxed">
                        Securely generate Solana wallets and seed phrases directly in your browser.
                    </p>
                </div>

                <div className="flex flex-wrap justify-center gap-3 w-full max-w-lg">
                    <Button onClick={handleGenerateMnemonic} variant={mnemonic ? "secondary" : "primary"} className="flex-1 justify-center">
                        <Plus className="w-4 h-4" /> {mnemonic ? "Generate New" : "Create Seed Phrase"}
                    </Button>
                    
                    <Button 
                        variant={isImporting ? "secondary" : "ghost"} 
                        onClick={() => setIsImporting(prev => !prev)}
                        className="flex-1 justify-center border border-zinc-800"
                    >
                        <Download className="w-4 h-4" /> Import Existing
                    </Button>
                </div>

                <AnimatePresence>
                    {isImporting && (
                        <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="w-full max-w-lg overflow-hidden"
                        >
                            <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl space-y-3 mt-2">
                                <textarea 
                                    value={importInput}
                                    onChange={(e) => setImportInput(e.target.value)}
                                    placeholder="Paste your 12 or 24 word mnemonic phrase here..."
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm text-white focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all resize-none h-24 font-mono"
                                />
                                <div className="flex justify-between items-center">
                                    <span className="text-red-400 text-xs font-medium">{importError}</span>
                                    <div className="flex gap-2">
                                        <Button variant="ghost" onClick={() => setIsImporting(false)} className="py-1.5 h-auto text-xs">
                                            Cancel
                                        </Button>
                                        <Button onClick={handleImportMnemonic} variant="primary" className="py-1.5 h-auto text-xs">
                                            Import Wallet
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {mnemonic && !isImporting && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex gap-3 w-full max-w-2xl mt-4"
                    >
                        <Button 
                            onClick={handleAddWallet} 
                            disabled={isLoading} 
                            variant="primary" 
                            className="flex-1 justify-center py-4 text-base border-2 border-white"
                        >
                            {isLoading ? (
                                <><RotateCw className="w-5 h-5 animate-spin" /> Generating...</>
                            ) : (
                                <><Wallet className="w-5 h-5" /> Add New Wallet</>
                            )}
                        </Button>
                        <Button onClick={handleClear} variant="danger" className="px-4">
                            <Trash2 className="w-5 h-5" />
                        </Button>
                    </motion.div>
                )}

                {mnemonic && <div className="w-full max-w-2xl h-px bg-zinc-800 my-4" />}

                {mnemonic && <MnemonicGrid mnemonic={mnemonic} />}

                <div className="w-full max-w-2xl space-y-4">
                    {wallets.length > 0 && (
                        <div className="flex items-center justify-between text-zinc-500 text-sm font-medium mb-2 pl-2">
                            <span className="flex items-center gap-2"><Wallet className="w-4 h-4" /> YOUR WALLETS ({wallets.length})</span>
                            <span className="text-xs bg-zinc-900 border border-zinc-800 px-2 py-1 rounded text-zinc-400">Devnet</span>
                        </div>
                    )}
                    
                    <AnimatePresence mode="popLayout">
                        {wallets.map((wallet, idx) => (
                            <WalletCard key={wallet.publicKey.toBase58()} wallet={wallet} index={idx} />
                        ))}
                    </AnimatePresence>
                </div>

                <div className="mt-12 flex flex-col items-center gap-4">
                    <div className="flex items-center gap-6">
                        <a href="https://x.com/ShreyVats01" target="_blank" rel="noreferrer" className="text-zinc-500 hover:text-white transition-colors">
                            <FaXTwitter className="w-5 h-5" />
                        </a>
                        <a href="https://github.com/Shrey-Vats" target="_blank" rel="noreferrer" className="text-zinc-500 hover:text-white transition-colors">
                            <FaGithub className="w-5 h-5" />
                        </a>
                    </div>
                    <p className="text-zinc-600 text-sm font-medium">
                        Created by <span className="text-zinc-300">Shrey Vats</span>
                    </p>
                </div>

            </main>
        </div>
    );
};

export default App;