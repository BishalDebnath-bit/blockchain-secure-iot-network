import {
  getDevice,
  registerDevice,
  updateDeviceStatus,
  updateDevicePermission,
} from "./api";

import { useState } from "react";
import "./App.css";

function App() {
  const [deviceId, setDeviceId] = useState("");
  const [credential, setCredential] = useState("");
  const [resource, setResource] = useState("temperature");
  const [message, setMessage] = useState("");
  const [lookupId, setLookupId] = useState("sensor-002");
  const [deviceInfo, setDeviceInfo] = useState<{
  deviceId: string;
  registered: boolean;
  active: boolean;
  registeredAt: string;
} | null>(null);
const [lookupMessage, setLookupMessage] = useState("");
const [lookingUp, setLookingUp] = useState(false);
  async function handleStatusChange(active: boolean) {
    if (!deviceInfo) return;

    setLookupMessage(
      `Updating ${deviceInfo.deviceId} status on the blockchain...`
    );

    try {
      const result = await updateDeviceStatus(
        deviceInfo.deviceId,
        active
      );

      const updatedDevice = await getDevice(deviceInfo.deviceId);
      setDeviceInfo(updatedDevice);

      setLookupMessage(
        `${result.message}. Transaction: ${result.transactionHash}`
      );
    } catch (error) {
      setLookupMessage(
        error instanceof Error
          ? error.message
          : "Status update failed"
      );
    }
  }

  return (
    <main className="dashboard">
      <header className="topbar">
        <div className="brand-mark">IoT</div>
        <div>
          <h1>Secure IoT Network</h1>
          <p>Blockchain-powered device access control</p>
        </div>
        <span className="status-badge">Local Network</span>
      </header>

      <section className="welcome">
        <p className="eyebrow">BLOCKCHAIN ADMINISTRATION</p>
        <h2>Device Management</h2>
        <p>
          Register devices and manage their access to protected resources.
        </p>
      </section>

      <section className="stats">
        <article className="stat-card">
          <span>Network</span>
          <strong>Hardhat</strong>
          <small>Local development chain</small>
        </article>
        <article className="stat-card">
          <span>Backend</span>
          <strong>Express API</strong>
          <small>Port 3000</small>
        </article>
        <article className="stat-card">
          <span>Security</span>
          <strong>Smart Contract</strong>
          <small>Device registry and permissions</small>
        </article>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <h3>Device Operations</h3>
            <p>Enter device details to begin.</p>
          </div>
          <span className="panel-icon">⌘</span>
        </div>

<form
  onSubmit={async (event) => {
    event.preventDefault();
    setMessage("Registering device on the blockchain...");

    try {
      const result = await registerDevice(deviceId, credential);
      setMessage(
        `Device registered successfully! Transaction: ${result.transactionHash}`
      );
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Registration failed"
      );
    }
  }}
>
          <label htmlFor="deviceId">Device ID</label>
          <input
            id="deviceId"
            value={deviceId}
            onChange={(event) => setDeviceId(event.target.value)}
            placeholder="e.g. sensor-001"
            required
          />

          <label htmlFor="credential">Device credential</label>
          <input
            id="credential"
            type="password"
            value={credential}
            onChange={(event) => setCredential(event.target.value)}
            placeholder="Enter device credential"
            required
          />

          <label htmlFor="resource">Protected resource</label>
          <select
            id="resource"
            value={resource}
            onChange={(event) => setResource(event.target.value)}
          >
            <option value="temperature">Temperature</option>
            <option value="security-camera">Security Camera</option>
            <option value="motion-sensor">Motion Sensor</option>
          </select>

          <button type="submit">Prepare Device Request</button>
        </form>

        {message && <p className="notice">{message}</p>}
      </section>
      
<section className="panel lookup-panel">
  <div className="panel-heading">
    <div>
      <h3>Device Lookup</h3>
      <p>Retrieve the current status from the smart contract.</p>
    </div>
  </div>

  <form
    onSubmit={async (event) => {
      event.preventDefault();
      setLookingUp(true);
      setDeviceInfo(null);
      setLookupMessage("");

      try {
        const result = await getDevice(lookupId.trim());
        setDeviceInfo(result);
      } catch (error) {
        setLookupMessage(
          error instanceof Error ? error.message : "Lookup failed"
        );
      } finally {
        setLookingUp(false);
      }
    }}
  >
    <label htmlFor="lookupId">Device ID</label>
    <input
      id="lookupId"
      value={lookupId}
      onChange={(event) => setLookupId(event.target.value)}
      placeholder="e.g. sensor-002"
      required
    />

    <button type="submit" disabled={lookingUp}>
      {lookingUp ? "Looking up..." : "Retrieve Device"}
    </button>
  </form>

  {lookupMessage && <p className="notice">{lookupMessage}</p>}

  {deviceInfo && (
    <div className="device-result">
      <h3>{deviceInfo.deviceId}</h3>
      <p>
        Registration: <strong>{deviceInfo.registered ? "Registered" : "Not registered"}</strong>
      </p>
      
<div className="status-actions">
  <button
    type="button"
    disabled={deviceInfo.active}
    onClick={() => handleStatusChange(true)}
  >
    Activate Device
  </button>

  <button
    type="button"
    disabled={!deviceInfo.active}
    onClick={() => handleStatusChange(false)}
  >
    Deactivate Device
  </button>
</div>

      
      <p>
        Status: <strong>{deviceInfo.active ? "Active" : "Inactive"}</strong>
      </p>
      
      <div className="permission-actions">
        <h4>Resource Permissions</h4>
        <p>Manage access to the selected protected resource.</p>

        <button
          type="button"
          onClick={async () => {
            setLookupMessage(
              `Granting ${resource} permission to ${deviceInfo.deviceId}...`
            );

            try {
              const result = await updateDevicePermission(
                deviceInfo.deviceId,
                resource,
                true
              );

              setLookupMessage(
                `${result.message}. Transaction: ${result.transactionHash}`
              );
            } catch (error) {
              setLookupMessage(
                error instanceof Error
                  ? error.message
                  : "Failed to grant permission"
              );
            }
          }}
        >
          Grant Selected Resource
        </button>

        <button
          type="button"
          onClick={async () => {
            setLookupMessage(
              `Revoking ${resource} permission from ${deviceInfo.deviceId}...`
            );

            try {
              const result = await updateDevicePermission(
                deviceInfo.deviceId,
                resource,
                false
              );

              setLookupMessage(
                `${result.message}. Transaction: ${result.transactionHash}`
              );
            } catch (error) {
              setLookupMessage(
                error instanceof Error
                  ? error.message
                  : "Failed to revoke permission"
              );
            }
          }}
        >
          Revoke Selected Resource
        </button>
      </div>

      <p>
        Registered at: <strong>{new Date(Number(deviceInfo.registeredAt) * 1000).toLocaleString()}</strong>
      </p>
    </div>
  )}
</section>


      <footer>
        Blockchain-Based Secure IoT Network · Development Dashboard
      </footer>
    </main>
  );
}

export default App;
