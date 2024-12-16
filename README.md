# Ping-Pong Bot for Ethereum Sepolia Testnet

This is a bot that listens for `Ping()` events emitted by a smart contract deployed on the Ethereum Sepolia testnet. It calls the `pong()` function for each emitted `Ping()`, passing the transaction hash of the `Ping()` event.

## For Local Testing
This bot was first tested on a local network using hardhat, if you wish to reproduce the functionality locally on a machine then please follow the instructions below.
## Local Installation

### Prerequisites
Before running the bot, ensure that you have the following installed:
- **Node.js** (version 16 or higher)
- **pnpm** (a fast package manager)
- **MongoDB** (for persistence)

### Steps to Install

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Kaushal-13/Bot_Syncer.git
   cd Bot_Syncer

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Create a `.env` file:**
   
   - `PRIVATE_KEY`: Your private key to sign transactions.
   - `INFURA_URL`: Your Infura URL to connect to Sepolia.
   - `CONTRACT_ADDRESS`: The address of the deployed Ping-Pong contract.
   - `MONGO_URI` : To connect with the mongodb database.
   - `BLOCK_NUMBER`: To store the beginning block number default to 0 for testing on a local network.

4. **Set up MongoDB:**
   Ensure your MongoDB instance is running. This bot stores the state of the `pong()` transactions in MongoDB for persistence.

### Running the Bot Locally

1. **Start a local blockchain for testing:**
   Use `npx hardhat node` to spin up a local testnet. This is useful for local development and testing.
2. **Compile the Smart Contract**
   Use `npx hardhat compile` to compile the smart contracts.
4. **Deploy the smart contract:**
   Deploy the Ping-Pong contract using the following script:
   ```bash
   node scripts/PingPong.js
   ```

5. **Emit a Ping event:**
   Run the following script to emit `Ping()` events:
   ```bash
   node scripts/pinger.js
   ```

6. **Run the bot:**
   To start the bot and have it listen for `Ping()` events and call `pong()`
   ```bash
   pnpm run run
   ```
```

