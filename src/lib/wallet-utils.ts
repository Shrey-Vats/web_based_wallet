import { Connection, PublicKey, LAMPORTS_PER_SOL, clusterApiUrl } from "@solana/web3.js";
import { JsonRpcProvider, formatEther } from "ethers";

// Solana
const SOLANA_RPC = clusterApiUrl('mainnet-beta'); // Using public mainnet RPC
const solanaConnection = new Connection(SOLANA_RPC);

// Ethereum
const ETH_RPC = "https://cloudflare-eth.com"; // Free public mainnet RPC
const ethProvider = new JsonRpcProvider(ETH_RPC);

// Bitcoin (Using blockstream.info public API for demo purposes)
const BTC_API_URL = "https://blockstream.info/api";

export async function getSolanaBalance(address: string): Promise<string> {
    try {
        const publicKey = new PublicKey(address);
        const balance = await solanaConnection.getBalance(publicKey);
        return (balance / LAMPORTS_PER_SOL).toFixed(4);
    } catch (error) {
        console.error("Error fetching SOL balance:", error);
        return "0.0000";
    }
}

export async function getEthereumBalance(address: string): Promise<string> {
    try {
        const balance = await ethProvider.getBalance(address);
        return parseFloat(formatEther(balance)).toFixed(4);
    } catch (error) {
        console.error("Error fetching ETH balance:", error);
        return "0.0000";
    }
}

export async function getBitcoinBalance(address: string): Promise<string> {
    try {
        const response = await fetch(`${BTC_API_URL}/address/${address}`);
        if (!response.ok) throw new Error("Failed to fetch BTC balance");
        const data = await response.json();
        const satoshis = data.chain_stats.funded_txo_sum - data.chain_stats.spent_txo_sum;
        return (satoshis / 100000000).toFixed(6);
    } catch (error) {
        console.error("Error fetching BTC balance:", error);
        // Fallback or rate limit handling could go here
        return "0.0000";
    }
}
