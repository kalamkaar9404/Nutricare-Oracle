/**
 * Deploy HealthIntegrity Smart Contract to Polygon Amoy Testnet
 * 
 * Prerequisites:
 * 1. Install Hardhat: npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
 * 2. Get testnet MATIC from: https://faucet.polygon.technology/
 * 3. Set your private key in .env file: PRIVATE_KEY=your_key_here
 * 
 * Run: npx hardhat run contracts/deploy.js --network polygonAmoy
 */

const hre = require("hardhat");

async function main() {
  console.log("Deploying HealthIntegrity contract to Polygon Amoy...");

  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  // Check balance
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "MATIC");

  if (balance === 0n) {
    console.error("❌ No MATIC balance!");
    console.log("Get testnet MATIC from: https://faucet.polygon.technology/");
    console.log("Your address:", deployer.address);
    process.exit(1);
  }

  // Deploy contract
  const HealthIntegrity = await hre.ethers.getContractFactory("HealthIntegrity");
  const contract = await HealthIntegrity.deploy();

  await contract.waitForDeployment();
  const address = await contract.getAddress();

  console.log("✅ HealthIntegrity deployed to:", address);
  console.log("\nUpdate BlockchainService.ts:");
  console.log(`  CONTRACT_ADDRESS = '${address}';`);
  console.log(`  USE_REAL_BLOCKCHAIN = true;`);
  
  // Test the contract
  console.log("\nTesting contract...");
  const testHash = "0x1234567890abcdef";
  const tx = await contract.storeHash(testHash);
  await tx.wait();
  console.log("✅ Test hash stored successfully");
  
  const [exists, timestamp] = await contract.verifyHash(testHash);
  console.log("✅ Test hash verified:", exists, "at timestamp:", timestamp.toString());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
