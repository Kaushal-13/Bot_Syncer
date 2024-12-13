

async function sendEther() {
    // Connect to a network (e.g., Hardhat local node)
    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
    console.log(provider)


    // Create a signer using a private key (ensure this is kept secret!)
    const signer = new ethers.Wallet("0xdf57089febbacf7ba0bc227dafbffa9fc08a93fdc68e1e42411a14efcf23656e", provider);
    console.log(signer)
    console.log("aenf")
    // Define the recipient and amount to send
    const recipient = "0xdD2FD4581271e230360230F9337D5c0430Bf44C0";
    const amount = ethers.parseEther("1000"); // Convert 0.1 Ether to Wei

    // Send the transaction
    const tx = await signer.sendTransaction({
        to: recipient,
        value: amount,
    });

    // console.log("Transaction Sent:", tx.hash);

    // // Wait for the transaction to be mined
    const receipt = await tx.wait();
    console.log("Transaction Mined:", receipt);
}

sendEther().catch(console.error);
