import { config } from "dotenv";
import fs from "fs";
import { ethers } from "ethers";


config();
const INFURA_URL = process.env.INFURA_URL

// Connect to Sepolia via Infura
const provider = new ethers.JsonRpcProvider(INFURA_URL);

export async function getLatestBlock() {
    try {
        const blockNumber = await provider.getBlockNumber();
        console.log(`Latest block number: ${blockNumber}`);
    } catch (error) {
        console.error("Error fetching the block number:", error);
    }
}


setInterval(getLatestBlock, 600000);

// Call it once immediately when the script starts
getLatestBlock();
