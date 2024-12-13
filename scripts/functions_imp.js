import { writeFile } from 'fs/promises';
import { config } from "dotenv";
config();
import { MongoClient } from 'mongodb';
import exp from 'constants';

const mongoUri = process.env.MONGO_URI
const increaseGasLimit = (estimatedGasLimit) => {
    return BigInt(estimatedGasLimit) * 130n / 100n; // Increase by 30%
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
            console.log(result)
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
        console.log(blockNumber);
        tx = await contract.pong(txHash)
        console.log(tx);
        console.log("Nonce for pong event ,", tx.nonce);
        receipt = await tx.wait();
        console.log("Pong event Completed");
        console.log(receipt);
    }
    catch (err) {
        console.log("Some Error Occured");
        console.error(err)
    }
    finally {
        const fail = true;
        if ((tx && !receipt) || (receipt && receipt.status === 0)) {
            console.log(tx);
            // add tx to the storage with the following stuff.
            const data = {
                "_id": txHash,
                "nonce": tx.nonce,
                "gas": increaseGasLimit(tx.gasLimit)
            }
            await updateDb(data, db);
            console.log(tx);
            return -1;
            // this means that the data could not be mined after this I will add it to a database of pending transactions and would then mine it.
        }
        else if (tx && receipt.status === 1) {
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
        console.log(data);
        const result = await collection.insertOne(myData);
        console.log(result)

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
        console.log(document);
        return data;
    } catch (error) {
        console.error(error);
        return -1;
    }
}

export async function getPendingPings(pingPongContract, prevBlockNumber, db) {
    try {
        const events = await pingPongContract.queryFilter(pingPongContract.filters.Ping(), prevBlockNumber, "latest");
        if (events.length > 0) {
            const finalEvents = events.slice(1); // Exclude the first event
            for (const element of finalEvents) {
                console.log(element);
                const data = {
                    transactionHash: element.transactionHash,
                    blockNumber: element.blockNumber,
                    gas: -1,
                    nonce: -1,
                    status: "Pending"
                };
                const status = await handlePing(db, data);
            }
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


