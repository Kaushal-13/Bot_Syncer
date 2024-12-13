async function getBalance() {
    const accounts = await ethers.getSigners();
    for (let i = 0; i < accounts.length; i++) {
        const balance = await ethers.provider.getBalance(accounts[i].address);
        console.log(`Account ${i}: ${accounts[i].address}`);
        console.log(`Balance: ${ethers.formatEther(balance)} ETH`);
    }
}

getBalance();