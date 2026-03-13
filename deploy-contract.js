/**
 * Simple contract deployment script for Polygon Amoy
 * Run: node deploy-contract.js
 */

const { ethers } = require('ethers');
const fs = require('fs');
require('dotenv').config();

// Read compiled contract (you need to compile first with hardhat)
const contractJson = require('./artifacts/contracts/HealthIntegrity.sol/HealthIntegrity.json');

async function deploy() {
  console.log('Deploying HealthIntegrity to Polygon Amoy...');
  
  // Connect to Polygon Amoy
  const provider = new ethers.JsonRpcProvider('https://rpc-amoy.polygon.technology');
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  
  console.log('Deployer address:', wallet.address);
  
  // Check balance
  const balance = await provider.getBalance(wallet.address);
  console.log('Balance:', ethers.formatEther(balance), 'MATIC');
  
  if (balance === 0n) {
    console.error('❌ No MATIC! Get testnet tokens from https://faucet.polygon.technology/');
    console.log('Your address:', wallet.address);
    process.exit(1);
  }
  
  // Deploy contract
  const factory = new ethers.ContractFactory(contractJson.abi, contractJson.bytecode, wallet);
  const contract = await factory.deploy();
  
  console.log('Transaction hash:', contract.deploymentTransaction().hash);
  console.log('Waiting for deployment...');
  
  await contract.waitForDeployment();
  const address = await contract.getAddress();
  
  console.log('✅ Contract deployed at:', address);
  console.log('\nUpdate BlockchainService.ts:');
  console.log(`  CONTRACT_ADDRESS = '${address}';`);
  
  // Test contract
  console.log('\nTesting contract...');
  const testHash = '0x1234567890abcdef';
  const tx = await contract.storeHash(testHash);
  await tx.wait();
  console.log('✅ Test hash stored');
  
  const [exists] = await contract.verifyHash(testHash);
  console.log('✅ Test hash verified:', exists);
}

deploy().catch(console.error);
