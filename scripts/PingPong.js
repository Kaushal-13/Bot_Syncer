import fs from "fs";
import { ethers } from "ethers";
import { config } from "dotenv";
config();
const privateKey = process.env.PRIVATE_KEY;
const artifactPath = './artifacts/contracts/PingPong.sol/PingPong.json'
const contractArtifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
const contractABI = contractArtifact.abi;
const contractBytecode = contractArtifact.bytecode;
const INFURA_URL = process.env.INFURA_URL
async function main() {
    const provider = new ethers.JsonRpcProvider(INFURA_URL);
    const deployer = new ethers.Wallet(privateKey, provider);

    const contractFactory = new ethers.ContractFactory(contractABI, contractBytecode, deployer);

    // Deploy the contract (this is where constructor arguments can be passed)
    console.log("Deploying contract...");
    const contract = await contractFactory.deploy();

    // Wait for the deployment to be mined
    const tx = await contract.deploymentTransaction().wait();
    console.log(contract)
    console.log(tx);
    console.log("PingPong contract deployed to:", contract.target);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
