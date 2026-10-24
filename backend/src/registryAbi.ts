
export const registryAbi = [
  "function admin() view returns (address)",
  "function registerDevice(bytes32 deviceId, bytes32 credentialHash)",
  "function setDeviceActive(bytes32 deviceId, bool active)",
  "function setPermission(bytes32 deviceId, bytes32 resource, bool allowed)",
  "function checkAccess(bytes32 deviceId, bytes32 credentialHash, bytes32 resource) returns (bool allowed)",
  "function getDevice(bytes32 deviceId) view returns (bool registered, bool active, uint256 registeredAt)",
  "event DeviceRegistered(bytes32 indexed deviceId, uint256 registeredAt)",
  "event DeviceStatusChanged(bytes32 indexed deviceId, bool active)",
  "event PermissionUpdated(bytes32 indexed deviceId, bytes32 indexed resource, bool allowed)",
  "event AccessChecked(bytes32 indexed deviceId, bytes32 indexed resource, bool allowed)",
] as const;
