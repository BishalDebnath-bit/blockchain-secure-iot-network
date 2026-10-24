
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { ethers } from "ethers";
import { registryAbi } from "./registryAbi.js";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;


const frontendOrigin =
  process.env.FRONTEND_ORIGIN || "http://localhost:5173";

app.use(cors({ origin: frontendOrigin }));
app.use(express.json());

const rpcUrl = process.env.RPC_URL;
const contractAddress = process.env.CONTRACT_ADDRESS;
const adminPrivateKey = process.env.ADMIN_PRIVATE_KEY;

if (!rpcUrl || !contractAddress || !adminPrivateKey) {
  throw new Error(
    "Missing RPC_URL, CONTRACT_ADDRESS, or ADMIN_PRIVATE_KEY"
  );
}

const provider = new ethers.JsonRpcProvider(rpcUrl);



// Local development only: first Hardhat account.
// Never use this publicly known key on a real network.
const adminWallet = new ethers.Wallet(
  adminPrivateKey,
  provider
);


const registry = new ethers.Contract(
  contractAddress,
  registryAbi,
  adminWallet
);

app.get("/", (_req, res) => {
  res.json({
    message: "Blockchain-Based Secure IoT Network API",
    status: "running",
  });
});

app.get("/health", async (_req, res) => {
  try {
    const network = await provider.getNetwork();
    const code = await provider.getCode(contractAddress);

    res.json({
      status: "healthy",
      blockchainConnected: true,
      chainId: network.chainId.toString(),
      contractDeployed: code !== "0x",
    });
  } catch {
    res.status(503).json({
      status: "unavailable",
      blockchainConnected: false,
    });
  }
});
app.post("/devices", async (req, res) => {
  try {
    const { deviceId, credential } = req.body;

    if (
      typeof deviceId !== "string" ||
      !deviceId.trim() ||
      typeof credential !== "string" ||
      !credential.trim()
    ) {
      res.status(400).json({
        error: "deviceId and credential are required strings",
      });
      return;
    }

    const deviceIdBytes = ethers.encodeBytes32String(deviceId);
    const credentialHash = ethers.keccak256(
      ethers.toUtf8Bytes(credential)
    );

    const tx = await registry.registerDevice(
      deviceIdBytes,
      credentialHash
    );

    const receipt = await tx.wait();

    res.status(201).json({
      message: "Device registered successfully",
      deviceId,
      transactionHash: receipt?.hash ?? tx.hash,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error";

    res.status(500).json({ error: message });
  }
});

app.get("/devices/:id", async (req, res) => {
  try {
    const deviceId = ethers.encodeBytes32String(req.params.id);

    const device = await registry.getDevice(deviceId);

    res.json({
      deviceId: req.params.id,
      registered: device.registered,
      active: device.active,
      registeredAt: device.registeredAt.toString(),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error";

    res.status(500).json({ error: message });
  }
});

app.patch("/devices/:id/status", async (req, res) => {
  try {
    const { active } = req.body;

    if (typeof active !== "boolean") {
      res.status(400).json({
        error: "active must be true or false",
      });
      return;
    }

    const deviceId = ethers.encodeBytes32String(req.params.id);

    const tx = await registry.setDeviceActive(deviceId, active);
    const receipt = await tx.wait();

    res.json({
      message: "Device status updated",
      deviceId: req.params.id,
      active,
      transactionHash: receipt?.hash ?? tx.hash,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error";

    res.status(500).json({ error: message });
  }
});

app.put("/devices/:id/permissions/:resource", async (req, res) => {
  try {
    const { allowed } = req.body;

    if (typeof allowed !== "boolean") {
      res.status(400).json({
        error: "allowed must be true or false",
      });
      return;
    }

    const deviceId = ethers.encodeBytes32String(req.params.id);
    const resource = ethers.encodeBytes32String(req.params.resource);

    const tx = await registry.setPermission(deviceId, resource, allowed);
    const receipt = await tx.wait();

    res.json({
      message: "Resource permission updated",
      deviceId: req.params.id,
      resource: req.params.resource,
      allowed,
      transactionHash: receipt?.hash ?? tx.hash,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error";

    res.status(500).json({ error: message });
  }
});

app.post("/devices/:id/check-access", async (req, res) => {
  try {
    const { credential, resource } = req.body;

    if (
      typeof credential !== "string" ||
      !credential.trim() ||
      typeof resource !== "string" ||
      !resource.trim()
    ) {
      res.status(400).json({
        error: "credential and resource are required strings",
      });
      return;
    }

    const deviceId = ethers.encodeBytes32String(req.params.id);
    const resourceId = ethers.encodeBytes32String(resource);
    const credentialHash = ethers.keccak256(
      ethers.toUtf8Bytes(credential)
    );

    const allowed: boolean = await registry.checkAccess.staticCall(
      deviceId,
      credentialHash,
      resourceId
    );

    res.json({
      deviceId: req.params.id,
      resource,
      allowed,
      reason: allowed
        ? "Device is active, credential is valid, and permission is granted"
        : "Access denied: device, credential, or permission check failed",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error";

    res.status(500).json({ error: message });
  }
});
export default app;





