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


## Design Considerations

### 1. **Event Querying with Block Numbers**
   - **Why Block Numbers?** 
     The bot uses the block number to track events sequentially. This approach ensures the bot processes events in the correct order. By using block numbers in `queryFilter`, it avoids processing events out of order and skips over already processed ones.
   - **How It Works:**
     - The bot tracks the last processed block number stored in MongoDB.
     - On each query, it starts from the last block number, ensuring no events are missed or reprocessed.
     - This design helps to ensure that the bot only queries for new `Ping()` events, making it both resource-efficient and accurate.

### 2. **Rate Limiting for Efficiency**
   - **Why Rate Limiting?** 
     Constant polling for events could overload both the bot and the blockchain node, leading to wasted resources. Instead, the bot queries every 10 minutes.
   - **How It Works:**
     - The bot checks for `Ping()` events at regular intervals (every 10 minutes), using a cron job to manage the polling frequency.
     - This reduces the load on both the bot and the Sepolia node by limiting unnecessary requests.
     - Querying by the latest block also ensures the bot doesn’t recheck already processed events, improving efficiency.

### 3. **Transaction Management and Nonce Handling**
  - The bot uses a **Nonce Manager** to ensure that each transaction is sent with the correct nonce, even when retrying failed transactions.
  - When a `pong()` transaction fails due to a high gas price or other reasons, the bot stores it in MongoDB and retries it with an increased gas limit by 10%.
  - Before retrying a transaction, the bot checks if the transaction has already been mined, further reducing unnecessary retries and saving gas.

### 4. **Persistent Data Storage with MongoDB**
  - Every `Ping()` event is saved in the database with an initial status of "Pending."
  - After the `pong()` transaction is successfully completed, the status is updated to "Done."
  - Failed transactions are stored with their details (including the nonce) and retried if necessary.
  - This structure allows the bot to pick up from where it left off after a restart or failure, ensuring smooth operation even in failure scenarios.

### 5. **Efficient Querying with Query Filters**
   - **Why Query Filters?**
     Using `queryFilter` ensures the bot only fetches relevant events, and avoids the overhead of listening to every new event. Query filters allow you to specify the exact criteria for the events you need.
   - **How It Works:**
     - The bot uses `queryFilter` to listen for `Ping()` events, starting from the last processed block number and querying only for new events.
     - By specifying the latest block number, the bot ensures it doesn’t recheck events it has already processed, making it highly efficient.
     - Additionally, the bot can increase the gas limit when a transaction fails, providing better control over failed transactions.

### 6. **Error Handling and Fault Tolerance**
   - The bot uses robust error handling for failed transactions and retries them automatically with a higher gas price.
   - It tracks failed transactions in MongoDB to prevent losing them due to temporary issues like network congestion or rate limits.
   - Before retrying any failed transaction, the bot checks if the transaction has already been mined to avoid unnecessary retries and wasting gas.


## Deployment on Railway

The bot is deployed on Railway using the free tier, simulating a rate-limited environment. Railway's free tier imposes limitations on both resources and API requests, making it ideal for testing how the bot behaves under constrained conditions.

### Why Railway?
- **Free Tier Simulation:** The Railway free tier allows us to simulate real-world rate limits and limited resources, which helps in optimizing the bot’s performance and ensuring that it works efficiently without overloading resources.

- **Continuous Operation:** The bot is deployed with a cron job running every 10 minutes, ensuring periodic checks for `Ping()` events and minimizing the load on both the provider and the server. This approach also helps mitigate potential network failures and ensures the bot remains operational for extended periods, even under strict rate limits.

By using Railway's free tier, we ensure that the bot is built to operate under resource constraints, similar to real-world production environments with API limits.

## Conclusion
The Ping-Pong bot is a robust solution for interacting with the Sepolia testnet’s `PingPong` smart contract. It is designed to be:
   - **Efficient** through block number-based querying and rate limiting.
   - **Fault-tolerant** with MongoDB storage for persistence and automatic retries for failed transactions.
   - **Scalable** with features like nonce management and efficient querying for high throughput.

This design ensures that the bot operates reliably under various conditions, providing a seamless and efficient solution for processing `Ping()` and `pong()` events.
