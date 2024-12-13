import { config } from "dotenv";
import fs from "fs";
import { ethers } from "ethers";
import { initializeDb, sendPong, getPendingPings, restartDb, fetchPing } from "./functions_imp.js";
import readlineSync from 'readline-sync';




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
    const db = await initializeDb();

    while (true) {
        const input = readlineSync.question("Input: ").trim().toLowerCase();
        console.log(input);
        if (input === 'mine') {
            console.log("Starting To mine Blocks");
            try {
                await getPendingPings(pingPongContract, 0, db);
            } catch (err) {
                console.error("Error generating Ping event:", err);
            }
        }
        else if (input === 'sendpong') {
            const data = await fetchPing(db);
            console.log(data);
            await sendPong(pingPongContract, data, db);
        }
        else if (input === 'restart') {
            await restartDb(db);
        }
        else {
            console.log("Invalid input. Type 'ping' to trigger the Ping event.");
        }
    }
    // Original Idea
    // pingPongContract.on("Ping", async (event) => {
    //     try {

    //         const transactionHash = event.log.transactionHash;
    //         console.log("Block Number: ", event.log.blockNumber);
    //         console.log(event.log.transactionHash)
    //         const blockNumber = event.log.blockNumber;
    //         const data = {
    //             "transactionHash": transactionHash,
    //             "blockNumber": blockNumber
    //         }
    //         await sendPong(pingPongContract, data, db);

    //     } catch (err) {
    //         handlePing(db, event);
    //         console.error(err);
    //     }

    // })
    // pingPongContract.on("Pong", (txHash, event) => {
    //     console.log(`Received Pong event with txHash: ${txHash}`);
    //     // console.log("Event details:", event);
    // });
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
