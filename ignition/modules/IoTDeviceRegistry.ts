
import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("IoTDeviceRegistryModule", (m) => {
  const registry = m.contract("IoTDeviceRegistry");

  return { registry };
});
