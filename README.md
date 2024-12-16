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
   git clone <repository-url>
   cd <repository-folder>
Install dependencies:

bash
Copy code
pnpm install
Create a .env file: Copy the .env.example to .env and fill in the required values:

PRIVATE_KEY: Your private key to sign transactions.
INFURA_URL: Your Infura URL to connect to Sepolia.
CONTRACT_ADDRESS: The address of the deployed Ping-Pong contract.
Set up MongoDB: Ensure your MongoDB instance is running. This bot stores the state of the pong() transactions in MongoDB for persistence.

Running the Bot Locally
Start a local blockchain for testing: Use npx hardhat node to spin up a local testnet. This is useful for local development and testing.

Deploy the smart contract: Deploy the Ping-Pong contract using the following script:

bash
Copy code
node scripts/PingPong.js
Emit a Ping event: Run the following script to emit Ping() events:

bash
Copy code
node scripts/pinger.js
