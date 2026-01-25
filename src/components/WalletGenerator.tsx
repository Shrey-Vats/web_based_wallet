import { useState } from "react";
import { generateMnemonic, mnemonicToSeedSync } from "bip39";
import { derivePath } from "ed25519-hd-key";
import { Keypair } from "@solana/web3.js";
import { Wallet as EtherWallet, HDNodeWallet } from "ethers";
import * as bitcoin from "bitcoinjs-lib";
import { BIP32Factory } from 'bip32';
import * as ecc from 'tiny-secp256k1';
import bs58 from "bs58";

import { Container } from "./container";
import { Heading } from "./heading";
import { SubHeading } from "./sub-heading";
import { Button } from "./ui/button";
import { FrameMarker } from "./frame-marker";
import { Copy, Check, RefreshCw, ChevronRight, Wallet, Shield, Globe, Lock, ArrowRight } from "lucide-react";
import { getSolanaBalance, getEthereumBalance, getBitcoinBalance } from "@/lib/wallet-utils";
import { cn } from "@/lib/utils";

const bip32 = BIP32Factory(ecc);

type Network = "SOL" | "ETH" | "BTC";

interface WalletAccount {
    address: string;
    privateKey: string;
    path: string;
    balance: string;
}

export function WalletGenerator() {
    const [step, setStep] = useState<"welcome" | "mnemonic" | "wallets">("welcome");
    const [mnemonic, setMnemonic] = useState("");
    const [selectedNetwork, setSelectedNetwork] = useState<Network>("SOL");
    
    const [solWallets, setSolWallets] = useState<WalletAccount[]>([]);
    const [ethWallets, setEthWallets] = useState<WalletAccount[]>([]);
    const [btcWallets, setBtcWallets] = useState<WalletAccount[]>([]);

    const [isVisible, setIsVisible] = useState(false);
    const [copied, setCopied] = useState(false);

    // Initial Wallet Generation
    const handleGenerateMnemonic = () => {
        const mn = generateMnemonic();
        setMnemonic(mn);
        setStep("mnemonic");
    };

    const handleContinue = () => {
        setStep("wallets");
        // Generate first wallet for current network if empty
        if (solWallets.length === 0 && selectedNetwork === 'SOL') addWallet('SOL');
        if (ethWallets.length === 0 && selectedNetwork === 'ETH') addWallet('ETH');
        if (btcWallets.length === 0 && selectedNetwork === 'BTC') addWallet('BTC');
    };

    const addWallet = async (network: Network) => {
        if (!mnemonic) return;
        const seed = mnemonicToSeedSync(mnemonic);
        
        let newWallet: WalletAccount;

        if (network === "SOL") {
            const index = solWallets.length;
            const path = `m/44'/501'/${index}'/0'`;
            const derivedSeed = derivePath(path, seed.toString("hex")).key;
            const keypair = Keypair.fromSeed(derivedSeed);
            newWallet = {
                address: keypair.publicKey.toBase58(),
                privateKey: bs58.encode(keypair.secretKey),
                path,
                balance: "0.0000"
            };
            setSolWallets(prev => [...prev, newWallet]);
            getSolanaBalance(newWallet.address).then(bal => {
                setSolWallets(prev => prev.map(w => w.address === newWallet.address ? {...w, balance: bal} : w));
            });
        } else if (network === "ETH") {
            const index = ethWallets.length;
            const path = `m/44'/60'/0'/0/${index}`;
            const hdNode = HDNodeWallet.fromSeed(seed);
            const childNode = hdNode.derivePath(path);
            const wallet = new EtherWallet(childNode.privateKey);
            newWallet = {
                address: wallet.address,
                privateKey: wallet.privateKey,
                path,
                balance: "0.0000"
            };
            setEthWallets(prev => [...prev, newWallet]);
             getEthereumBalance(newWallet.address).then(bal => {
                setEthWallets(prev => prev.map(w => w.address === newWallet.address ? {...w, balance: bal} : w));
            });
        } else {
            const index = btcWallets.length;
            const path = `m/84'/0'/0'/0/${index}`;
            const root = bip32.fromSeed(seed);
            const child = root.derivePath(path);
            const { address } = bitcoin.payments.p2wpkh({
                pubkey: child.publicKey,
                network: bitcoin.networks.bitcoin,
            });
            newWallet = {
                address: address || "",
                privateKey: child.toWIF(),
                path,
                balance: "0.0000"
            };
            setBtcWallets(prev => [...prev, newWallet]);
            if(newWallet.address) {
                getBitcoinBalance(newWallet.address).then(bal => {
                    setBtcWallets(prev => prev.map(w => w.address === newWallet.address ? {...w, balance: bal} : w));
                });
            }
        }
    };
    
    const refreshBalances = async (network: Network) => {
        if (network === "SOL") {
             const updated = await Promise.all(solWallets.map(async w => ({...w, balance: await getSolanaBalance(w.address)})));
             setSolWallets(updated);
        } else if (network === "ETH") {
             const updated = await Promise.all(ethWallets.map(async w => ({...w, balance: await getEthereumBalance(w.address)})));
             setEthWallets(updated);
        } else {
             const updated = await Promise.all(btcWallets.map(async w => ({...w, balance: await getBitcoinBalance(w.address)})));
             setBtcWallets(updated);
        }
    }

    const clearAll = () => {
        setMnemonic("");
        setSolWallets([]);
        setEthWallets([]);
        setBtcWallets([]);
        setStep("welcome");
    }

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <section className="relative overflow-hidden z-10 flex-1 flex flex-col justify-center">
            <Container className="py-12 md:py-20 relative w-full">
                
                {/* Step 1: Welcome / Landing Page */}
                {step === "welcome" && (
                     <div className="flex flex-col items-center gap-16 animate-in fade-in duration-700">
                        {/* Hero Section */}
                        <div className="flex flex-col items-center text-center gap-6 max-w-3xl mx-auto mt-8 md:mt-16">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-sky-500/20 bg-sky-500/10 text-sky-500 text-xs font-medium mb-4">
                                <Shield className="size-3" /> Secure & Non-Custodial
                            </div>
                            
                            <Heading variant="big" as="h1" className="leading-tight">
                                One Seed, <br className="md:hidden"/> 
                                <span className="bg-gradient-to-r from-sky-500 to-indigo-500 bg-clip-text text-transparent">Multi-Chain</span> Mastery
                            </Heading>
                            
                            <SubHeading variant="medium" className="max-w-xl mx-auto text-lg leading-relaxed">
                                Generate secure wallets for Solana, Ethereum, and Bitcoin instantly. 
                                Your keys never leave this browser.
                            </SubHeading>

                            <div className="flex flex-col sm:flex-row gap-4 mt-4 w-full sm:w-auto">
                                <Button 
                                    onClick={handleGenerateMnemonic} 
                                    size="lg" 
                                    className="text-base px-8 py-6 rounded-xl shadow-lg shadow-sky-500/20 hover:shadow-sky-500/40 hover:-translate-y-0.5 transition-all bg-sky-600 hover:bg-sky-500"
                                >
                                    Create New Wallet <ArrowRight className="ml-2 size-5" />
                                </Button>
                                {/* <Button variant="outline" size="lg" className="text-base px-8 py-6 rounded-xl border-dashed">
                                    Import Wallet
                                </Button> */}
                            </div>
                        </div>

                        {/* Features Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl px-4">
                            <FeatureCard 
                                icon={Globe} 
                                title="Multi-Chain Support" 
                                description="Seamlessly manage SOL, ETH, and BTC addresses derived from a single seed phrase." 
                            />
                            <FeatureCard 
                                icon={Lock} 
                                title="100% Private" 
                                description="Your private keys are generated locally. We have zero access to your funds or data." 
                            />
                            <FeatureCard 
                                icon={Wallet} 
                                title="Portfolio View" 
                                description="View your assets and public addresses in a clean, unified dashboard." 
                            />
                        </div>
                     </div>
                )}

                {/* Step 2: Mnemonic Display */}
                {step === "mnemonic" && (
                    <div className="max-w-3xl mx-auto flex flex-col gap-8 animate-in slide-in-from-right-8 duration-500 mt-8">
                        <div className="text-center space-y-2">
                            <Heading variant="medium">Secret Recovery Phrase</Heading>
                            <SubHeading>Write down these 12 words and keep them safe.</SubHeading>
                        </div>

                        <div 
                            className="relative border border-dashed border-sky-500/30 bg-background/50 backdrop-blur-xl p-8 rounded-2xl group cursor-pointer shadow-2xl shadow-sky-500/5"
                            onClick={() => copyToClipboard(mnemonic)}
                        >
                             <FrameMarker />
                             <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
                                {mnemonic.split(" ").map((word, i) => (
                                    <div key={i} className="bg-muted/40 border border-muted-foreground/10 p-3 rounded-lg text-center font-mono text-base relative hover:bg-sky-500/10 transition-colors">
                                        <span className="absolute top-1 left-2 text-[10px] text-muted-foreground/60 select-none font-sans">{i+1}</span>
                                        {word}
                                    </div>
                                ))}
                             </div>
                             <div className="absolute top-4 right-4 text-xs text-muted-foreground flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                {copied ? <Check className="size-3 text-green-500"/> : <Copy className="size-3"/>}
                                {copied ? "Copied" : "Click to copy"}
                             </div>
                        </div>

                        <div className="flex flex-col items-center gap-4">
                            <div className="flex items-center gap-2 text-yellow-500/80 bg-yellow-500/10 px-4 py-2 rounded-lg border border-yellow-500/20 text-sm">
                                <Shield className="size-4" />
                                <span>Anyone with these words can steal your assets. Never share them.</span>
                            </div>

                            <div className="flex justify-center gap-4 w-full mt-4">
                                <Button variant="ghost" onClick={clearAll} className="w-1/3">Cancel</Button>
                                <Button onClick={handleContinue} className="w-1/3 bg-sky-600 hover:bg-sky-500">
                                    I Saved It <ChevronRight className="size-4 ml-2"/>
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 3: Wallet Dashboard */}
                {step === "wallets" && (
                    <div className="max-w-5xl mx-auto flex flex-col gap-8 animate-in fade-in zoom-in-95 duration-500">
                        
                        {/* Header & Controls */}
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4 p-6 border-b border-dashed border-border/50 bg-background/50 backdrop-blur-sm rounded-t-xl">
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-sky-500/10 rounded-lg">
                                    <Wallet className="size-6 text-sky-500"/>
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold tracking-tight">My Wallets</h2>
                                    <p className="text-xs text-muted-foreground">Manage your generated addresses</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={() => {setMnemonic(""); setStep("welcome")}}>
                                    Clear & Exit
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => setIsVisible(!isVisible)}>
                                    {isVisible ? "Hide Secrets" : "Show Secrets"}
                                </Button>
                            </div>
                        </div>

                        {/* Network Tabs */}
                        <div className="flex flex-col md:flex-row gap-6">
                            <div className="flex md:flex-col gap-2 p-1 bg-muted/30 rounded-xl h-fit border border-dashed md:w-48 sticky top-24">
                                {(["SOL", "ETH", "BTC"] as Network[]).map((net) => (
                                    <button
                                        key={net}
                                        onClick={() => setSelectedNetwork(net)}
                                        className={cn(
                                            "px-4 py-3 rounded-lg text-sm font-medium transition-all text-left flex items-center gap-3",
                                            selectedNetwork === net 
                                                ? "bg-background shadow-sm text-sky-500 ring-1 ring-border" 
                                                : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                                        )}
                                    >
                                        <div className={cn("size-2 rounded-full", 
                                            net === "SOL" ? "bg-purple-500" : net === "ETH" ? "bg-blue-500" : "bg-orange-500"
                                        )} />
                                        {net === "SOL" ? "Solana" : net === "ETH" ? "Ethereum" : "Bitcoin"}
                                    </button>
                                ))}
                            </div>

                            {/* Wallet List */}
                            <div className="flex-1 space-y-4">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-lg font-semibold flex items-center gap-2">
                                        {selectedNetwork === "SOL" ? "Solana" : selectedNetwork === "ETH" ? "Ethereum" : "Bitcoin"} 
                                        <span className="text-muted-foreground font-normal">Wallets</span>
                                    </h3>
                                    <div className="flex gap-2">
                                         <Button variant="outline" size="sm" onClick={() => refreshBalances(selectedNetwork)}>
                                            <RefreshCw className="size-4 mr-2"/> Refresh
                                        </Button>
                                        <Button onClick={() => addWallet(selectedNetwork)} className="bg-sky-600 hover:bg-sky-500">
                                            + Add New
                                        </Button>
                                    </div>
                                </div>

                                <div className="grid gap-4">
                                    {(selectedNetwork === "SOL" ? solWallets : selectedNetwork === "ETH" ? ethWallets : btcWallets).map((wallet, idx) => (
                                        <WalletCard 
                                            key={wallet.address} 
                                            wallet={wallet} 
                                            index={idx} 
                                            showSecret={isVisible}
                                            network={selectedNetwork}
                                        />
                                    ))}
                                    {(selectedNetwork === "SOL" ? solWallets : selectedNetwork === "ETH" ? ethWallets : btcWallets).length === 0 && (
                                        <div className="flex flex-col items-center justify-center py-16 border border-dashed rounded-xl bg-muted/10 text-center">
                                            <div className="p-4 bg-muted/50 rounded-full mb-4">
                                                <Wallet className="size-8 text-muted-foreground/50" />
                                            </div>
                                            <p className="text-muted-foreground font-medium">No wallets generated yet</p>
                                            <p className="text-sm text-muted-foreground/60 max-w-xs mt-1 mb-4">
                                                Create your first {selectedNetwork} wallet to start interacting with the blockchain.
                                            </p>
                                            <Button variant="outline" onClick={() => addWallet(selectedNetwork)}>Generate Wallet</Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

            </Container>
        </section>
    );
}

function FeatureCard({ icon: Icon, title, description }: { icon: any, title: string, description: string }) {
    return (
        <div className="p-6 rounded-2xl border border-dashed border-border/60 bg-background/50 hover:bg-muted/30 transition-colors group">
            <div className="size-10 rounded-lg bg-sky-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Icon className="size-5 text-sky-500" />
            </div>
            <h3 className="text-lg font-semibold mb-2">{title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
        </div>
    )
}

function WalletCard({ wallet, index, showSecret, network }: { wallet: WalletAccount, index: number, showSecret: boolean, network: string }) {
    const [copied, setCopied] = useState(false);
    
    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    const colorClass = network === "SOL" ? "text-purple-500" : network === "ETH" ? "text-blue-500" : "text-orange-500";
    const borderClass = network === "SOL" ? "hover:border-purple-500/30" : network === "ETH" ? "hover:border-blue-500/30" : "hover:border-orange-500/30";

    return (
        <div className={`relative border border-dashed p-6 rounded-xl bg-background/60 transition-all ${borderClass} group overflow-hidden shadow-sm hover:shadow-md`}>
            {/* Background decorative index */}
            <div className="absolute -top-4 -right-4 size-24 bg-muted/50 rounded-full flex items-center justify-center text-4xl font-bold opacity-10 pointer-events-none">
                {index + 1}
            </div>
            
            <div className="space-y-6 relative z-10">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg bg-muted/50 ${colorClass.replace('text-', 'bg-').replace('500', '500/10')}`}>
                             <Wallet className={`size-5 ${colorClass}`}/>
                        </div>
                        <div>
                            <h4 className="font-bold text-lg flex items-center gap-2">
                                Wallet {index + 1}
                            </h4>
                            <span className="text-xs font-mono text-muted-foreground">
                                {wallet.path}
                            </span>
                        </div>
                    </div>
                    <div className="text-left sm:text-right bg-muted/20 sm:bg-transparent p-2 sm:p-0 rounded-lg w-full sm:w-auto">
                         <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Balance</p>
                         <p className={`text-xl font-mono font-bold ${colorClass}`}>
                             {wallet.balance} <span className="text-sm text-muted-foreground">{network}</span>
                         </p>
                    </div>
                </div>

                <div className="grid gap-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                            <Globe className="size-3" /> Public Address
                        </label>
                        <div 
                            className="bg-muted/30 hover:bg-muted/50 border border-transparent hover:border-border transition-colors p-3 rounded-lg font-mono text-sm break-all flex items-center justify-between cursor-pointer group/copy"
                            onClick={() => copyToClipboard(wallet.address)}
                        >
                            <span className="truncate mr-2">{wallet.address}</span>
                            {copied ? <Check className="size-4 text-green-500 shrink-0"/> : <Copy className="size-4 text-muted-foreground/50 group-hover/copy:text-foreground shrink-0 transition-colors"/>}
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1 justify-between">
                            <span className="flex items-center gap-1"><Lock className="size-3" /> Private Key</span>
                            {!showSecret && <span className="text-[10px] bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 px-1.5 py-0.5 rounded border border-yellow-500/20">Hidden</span>}
                        </label>
                         <div className="relative group/secret">
                            <div 
                                className="bg-muted/30 border border-transparent p-3 rounded-lg font-mono text-sm break-all flex items-center justify-between"
                            >
                                <span className={cn("truncate mr-2", !showSecret && "blur-sm select-none opacity-50")}>
                                    {showSecret ? wallet.privateKey : "•".repeat(64)}
                                </span>
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-6 w-6 shrink-0 opacity-50 group-hover/secret:opacity-100 transition-opacity"
                                    onClick={() => copyToClipboard(wallet.privateKey)}
                                    disabled={!showSecret}
                                >
                                    <Copy className="size-3"/>
                                </Button>
                            </div>
                            {!showSecret && (
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <span className="text-xs font-medium text-muted-foreground bg-background/80 backdrop-blur-sm px-2 py-1 rounded shadow-sm">Click "Show Secrets" to reveal</span>
                                </div>
                            )}
                         </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
