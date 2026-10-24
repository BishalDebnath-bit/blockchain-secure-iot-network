
import { expect } from "chai";
import { network } from "hardhat";

const { ethers } = await network.create();

describe("IoTDeviceRegistry", function () {
  async function deployRegistry() {
    const [admin, other] = await ethers.getSigners();
    const registry = await ethers.deployContract("IoTDeviceRegistry");

    const deviceId = ethers.encodeBytes32String("sensor-001");
    const credential = ethers.encodeBytes32String("secret-001");
    const resource = ethers.encodeBytes32String("temperature");

    return { registry, admin, other, deviceId, credential, resource };
  }

  it("allows the administrator to register a device", async function () {
    const { registry, deviceId, credential } = await deployRegistry();

    await expect(registry.registerDevice(deviceId, credential))
      .to.emit(registry, "DeviceRegistered");

    const device = await registry.getDevice(deviceId);
    expect(device.registered).to.equal(true);
    expect(device.active).to.equal(true);
  });

  it("rejects registration by a non-administrator", async function () {
    const { registry, other, deviceId, credential } = await deployRegistry();

    await expect(
      registry.connect(other).registerDevice(deviceId, credential)
    ).to.be.revertedWith("Not admin");
  });

  it("allows access when the device and permission are valid", async function () {
    const { registry, deviceId, credential, resource } = await deployRegistry();

    await registry.registerDevice(deviceId, credential);
    await registry.setPermission(deviceId, resource, true);

    await expect(registry.checkAccess(deviceId, credential, resource))
      .to.emit(registry, "AccessChecked")
      .withArgs(deviceId, resource, true);
  });

  it("rejects an incorrect credential", async function () {
    const { registry, deviceId, credential, resource } = await deployRegistry();

    await registry.registerDevice(deviceId, credential);
    await registry.setPermission(deviceId, resource, true);

    const wrongCredential = ethers.encodeBytes32String("wrong-secret");

    await expect(
      registry.checkAccess(deviceId, wrongCredential, resource)
    )
      .to.emit(registry, "AccessChecked")
      .withArgs(deviceId, resource, false);
  });

  it("rejects access when permission has not been granted", async function () {
    const { registry, deviceId, credential, resource } = await deployRegistry();

    await registry.registerDevice(deviceId, credential);

    await expect(registry.checkAccess(deviceId, credential, resource))
      .to.emit(registry, "AccessChecked")
      .withArgs(deviceId, resource, false);
  });

  it("rejects access from a deactivated device", async function () {
    const { registry, deviceId, credential, resource } = await deployRegistry();

    await registry.registerDevice(deviceId, credential);
    await registry.setPermission(deviceId, resource, true);
    await registry.setDeviceActive(deviceId, false);

    await expect(registry.checkAccess(deviceId, credential, resource))
      .to.emit(registry, "AccessChecked")
      .withArgs(deviceId, resource, false);
  });

  it("rejects an unregistered device", async function () {
    const { registry, deviceId, credential, resource } = await deployRegistry();

    await expect(registry.checkAccess(deviceId, credential, resource))
      .to.emit(registry, "AccessChecked")
      .withArgs(deviceId, resource, false);
  });
});
