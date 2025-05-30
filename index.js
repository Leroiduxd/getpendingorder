import express from "express";
import { ethers } from "ethers";
import dotenv from "dotenv";
import fetch from "node-fetch";
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const RPC_URL = process.env.RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

const ABI = [
  {
    "inputs": [],
    "name": "getAllPendingOrders",
    "outputs": [
      { "internalType": "uint256[]", "name": "orderIds", "type": "uint256[]" },
      { "internalType": "address[]", "name": "users", "type": "address[]" },
      { "internalType": "uint256[]", "name": "assetIndexes", "type": "uint256[]" },
      { "internalType": "uint256[]", "name": "usdSizes", "type": "uint256[]" },
      { "internalType": "uint256[]", "name": "leverages", "type": "uint256[]" },
      { "internalType": "bool[]", "name": "isLongs", "type": "bool[]" },
      { "internalType": "uint256[]", "name": "slPrices", "type": "uint256[]" },
      { "internalType": "uint256[]", "name": "tpPrices", "type": "uint256[]" },
      { "internalType": "uint256[]", "name": "timestamps", "type": "uint256[]" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "orderId", "type": "uint256" },
      { "internalType": "bytes", "name": "proof", "type": "bytes" }
    ],
    "name": "executePendingOrder",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet);

app.get("/execute-all", async (req, res) => {
  try {
    const result = await contract.getAllPendingOrders();
    const orderIds = result[0].map(id => Number(id));
    const assetIndexes = result[2].map(index => Number(index));

    const responses = [];

    for (let i = 0; i < orderIds.length; i++) {
      const orderId = orderIds[i];
      const index = assetIndexes[i];

      const proofRes = await fetch("https://proof-production.up.railway.app/get-proof", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ index })
      });

      const proofData = await proofRes.json();
      const proof = proofData.proof_bytes;

      const tx = await contract.executePendingOrder(orderId, proof);
      await tx.wait();

      responses.push({ orderId, status: "executed", txHash: tx.hash });
    }

    res.json({ executed: responses });
  } catch (err) {
    console.error("Error executing orders:", err);
    res.status(500).json({ error: "Failed to execute orders", details: err.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
