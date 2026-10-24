
const API_BASE_URL = "http://localhost:3000";

export async function registerDevice(
  deviceId: string,
  credential: string
) {
  const response = await fetch(`${API_BASE_URL}/devices`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ deviceId, credential }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Device registration failed");
  }

  return data;
}

export async function getDevice(deviceId: string) {
  const response = await fetch(
    `${API_BASE_URL}/devices/${encodeURIComponent(deviceId)}`
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to retrieve device");
  }

  return data as {
    deviceId: string;
    registered: boolean;
    active: boolean;
    registeredAt: string;
  };
}

export async function updateDeviceStatus(
  deviceId: string,
  active: boolean
) {
  const response = await fetch(
    `${API_BASE_URL}/devices/${encodeURIComponent(deviceId)}/status`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ active }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to update device status");
  }

  return data as {
    message: string;
    deviceId: string;
    active: boolean;
    transactionHash: string;
  };
}

export async function updateDevicePermission(
  deviceId: string,
  resource: string,
  allowed: boolean
) {
  const response = await fetch(
    `${API_BASE_URL}/devices/${encodeURIComponent(deviceId)}/permissions/${encodeURIComponent(resource)}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ allowed }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to update permission");
  }

  return data as {
    message: string;
    deviceId: string;
    resource: string;
    allowed: boolean;
    transactionHash: string;
  };
}


