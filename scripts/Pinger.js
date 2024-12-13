
import readlineSync from 'readline-sync';
import { ethers, Wallet } from "ethers";
import { config } from "dotenv";
import fs from "fs";
config();
const privateKey = process.env.PRIVATE_KEY;
const artifactPath = './artifacts/contracts/PingPong.sol/PingPong.json'
const contractArtifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
const contractABI = contractArtifact.abi;
const contractBytecode = contractArtifact.bytecode;


const contractAddress = process.env.CONTRACT_ADDRESS

async function main() {
    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
    const wallet = new ethers.Wallet(privateKey, provider);
    const signer = new ethers.NonceManager(wallet);
    // console.log(signer);
    const pingPongContract = new ethers.Contract(contractAddress, contractABI, signer);
    const currentPinger = await pingPongContract.pinger();
    console.log("Current pinger:", currentPinger);
    while (true) {
        const input = readlineSync.question("Input: ").trim().toLowerCase();

        if (input === 'ping') {
            console.log("Generating Ping event...");
            try {

                const tx = await pingPongContract.ping();
                console.log("Ping transaction sent, waiting for confirmation...");
                console.log(tx);
                console.log("Nonce", tx.nonce);
                console.log("Gas Limit", tx.gasLimit)

                const rec = await tx.wait();  // Wait for the transaction to be mined
                // console.log("Ping event generated!", rec);// Delay in milliseconds (3 seconds)
            } catch (err) {
                console.error("Error generating Ping event:", err);
            }
        } else {
            console.log("Invalid input. Type 'ping' to trigger the Ping event.");
        }
    }
}



main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
