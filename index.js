import express from "express";
import { ethers } from "ethers";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const RPC_URL = process.env.RPC_URL;

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
  }
];

const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);

app.get("/pending-orders", async (req, res) => {
  try {
    const result = await contract.getAllPendingOrders();
    const orderIds = result[0];
    const assetIndexes = result[2];
    res.json({ orderIds, assetIndexes });
  } catch (err) {
    console.error("Error fetching pending orders:", err);
    res.status(500).json({ error: "Failed to fetch pending orders" });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
