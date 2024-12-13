import { ethers } from "ethers";
import fs from "fs";
import { config } from "dotenv";
import { sendPong } from "./functions_imp.js";
config();
const privateKey = process.env.PRIVATE_KEY;
const contractAddress = process.env.CONTRACT_ADDRESS
const artifactPath = './artifacts/contracts/PingPong.sol/PingPong.json'
const contractArtifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
const contractABI = contractArtifact.abi;
const contractBytecode = contractArtifact.bytecode;

async function pendingPongs(pingPongContract, prevBlockNumber, wallet) {
    console.log(pingPongContract)
    const events = await pingPongContract.queryFilter(pingPongContract.filters.Ping(), prevBlockNumber, "latest");
    if (events.length > 0) {
        const finalEvents = events.slice(1); // Exclude the first event
        for (const element of finalEvents) {
            console.log(element);
            const data = {
                blockHash: element.blockHash,
                transactionHash: element.transactionHash,
            };
            try {
                const status = await sendPong(pingPongContract, element.transactionHash, element.blockNumber);
            } catch (error) {
                console.error("Error sending pong:", error);
            }
        }
    }
}

async function main() {
    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
    console.log(provider)
    const wallet = new ethers.Wallet(privateKey, provider);
    const signer = ethers.NonceManager(wallet);
    const pingPongContract = new ethers.Contract(contractAddress, contractABI, signer);
    if (true) {
        pendingPongs(pingPongContract, prevBlockHash, signer);
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
