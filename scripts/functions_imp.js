import { writeFile } from 'fs/promises';
import { config } from "dotenv";
config();
import { MongoClient } from 'mongodb';


const mongoUri = process.env.MONGO_URI
const startBlock = process.env.BLOCK_NUMBER
const increaseGasLimit = (estimatedGasLimit) => {
    return max(BigInt(estimatedGasLimit) * 110n / 100n, 40000n);
    // Increase by 10% Cap at 40000
};

export async function initializeDb() {
    const dbName = 'Events';
    const client = new MongoClient(mongoUri);
    await client.connect();
    const db = client.db(dbName);
    // console.log("DataBase is :")
    // console.log(db);
    return db;
}
async function updateDb(data, db) {
    const collection = db.collection('Ping_Events')
    const _id = data._id;
    if (!("status" in data)) {
        try {
            const result = await collection.updateOne(
                { _id: data._id },
                { $set: { data } });
        } catch (error) {
            console.error(error)
        }
    }
    else {
        try {

            const result = await collection.updateOne(
                { _id: data._id },
                { $set: { "status": "done" } });
            // console.log(result)
        } catch (error) {
            console.error(error)
        }
    }
}
export async function sendPong(contract, data, db) {
    let tx = null;
    let receipt = null;
    console.log(data);
    const txHash = data._id;
    const nonce = data.nonce;
    const blockNumber = data.blockNumber;
    try {
        // console.log("Data is ", data)
        if (data) {
            if ("pongId" in data) {
                const rec = await provider.getTransactionReceipt(data.pongId);
                if (rec) {
                    receipt = rec;
                }
                else {
                    tx = await contract.pong(txHash, { nonce: nonce, gasLimit: data.gas })
                    receipt = await tx.wait();
                    console.log("Pong event Completed");
                }
            }
            else {
                tx = await contract.pong(txHash)
                receipt = await tx.wait();
                console.log("Pong Event for transaction hash is", txHash)
                console.log("Pong event Completed with transaction hash.", tx.hash);
            }
        }
    }
    catch (err) {
        console.log("Some Error Occured");
        console.error(err)
    }
    finally {

        if ((tx && !receipt) || (receipt && receipt.status === 0)) {
            // console.log(tx);
            // add tx to the storage with the following stuff.
            const data = {
                "_id": txHash,
                "nonce": tx.nonce,
                "gas": increaseGasLimit(tx.gasLimit),
                "pongId": tx.transactionHash
            }
            await updateDb(data, db);
            return -1;
            // this means that the data could not be mined after this I will add it to a database of pending transactions and would then mine it.
        }
        else if (tx && receipt && receipt.status === 1) {
            const data = {
                "_id": txHash,
                "status": "done"
            }
            await updateDb(data, db);
            return 1;
        }
        else {
            return 0;
        }
    }
}



export async function handlePing(db, data) {
    try {

        console.log("From Handle Ping")
        const collection = db.collection('Ping_Events');
        const myData = {
            "_id": data.transactionHash,
            "blockNumber": data.blockNumber,
            "gas": data.gas,
            "nonce": data.nonce,
            "status": data.status
        }
        const result = await collection.insertOne(myData);
        // console.log(result)

    } catch (error) {
        console.error(error)

    }
}
export async function fetchPing(db) {
    const query = { "status": "Pending" };
    try {
        const collection = db.collection('Ping_Events')
        const document = await collection.findOne(query, { sort: { blockNumber: 1 } });
        const data = document
        // console.log(document);
        return data;
    } catch (error) {
        console.error(error);
        return -1;
    }
}

export async function fetchLatest(db) {
    const query = {};
    try {
        const collection = db.collection('Ping_Events')
        const document = await collection.findOne(query, { sort: { blockNumber: -1 } });
        const data = document
        // console.log(data);
        if (data && "blockNumber" in data) {
            return data.blockNumber;
        }
        return startBlock;

    } catch (error) {
        console.error(error);
        return -1;
    }

}

export async function getPendingPings(pingPongContract, prevBlockNumber, db) {
    try {
        const events = await pingPongContract.queryFilter(pingPongContract.filters.Ping(), prevBlockNumber, "latest");
        if (events.length > 0) {
            const finalEvents = events // Exclude the first event
            for (const element of finalEvents) {
                const data = {
                    transactionHash: element.transactionHash,
                    blockNumber: element.blockNumber,
                    gas: -1,
                    nonce: -1,
                    status: "Pending"
                };
                const status = await handlePing(db, data);
            }
            console.log("No of pending ping events : ", events.length)
        }
    } catch (error) {
        console.error(error);
    }
}

export async function restartDb(db) {
    try {
        const collection = db.collection('Ping_Events')
        const result = await collection.deleteMany({});
        console.log(result);
    } catch (err) {
        console.error(err);
    }
}


