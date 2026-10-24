
 // SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract IoTDeviceRegistry {
    address public immutable admin;

    struct Device {
        bytes32 credentialHash;
        bool registered;
        bool active;
        uint256 registeredAt;
    }

    mapping(bytes32 => Device) private devices;
    mapping(bytes32 => mapping(bytes32 => bool)) private permissions;

    event DeviceRegistered(
        bytes32 indexed deviceId,
        uint256 registeredAt
    );

    event DeviceStatusChanged(
        bytes32 indexed deviceId,
        bool active
    );

    event PermissionUpdated(
        bytes32 indexed deviceId,
        bytes32 indexed resource,
        bool allowed
    );

    event AccessChecked(
        bytes32 indexed deviceId,
        bytes32 indexed resource,
        bool allowed
    );

    modifier onlyAdmin() {
        require(msg.sender == admin, "Not admin");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    function registerDevice(
        bytes32 deviceId,
        bytes32 credentialHash
    ) external onlyAdmin {
        require(deviceId != bytes32(0), "Invalid device ID");
        require(credentialHash != bytes32(0), "Invalid credential");
        require(!devices[deviceId].registered, "Already registered");

        devices[deviceId] = Device({
            credentialHash: credentialHash,
            registered: true,
            active: true,
            registeredAt: block.timestamp
        });

        emit DeviceRegistered(deviceId, block.timestamp);
    }

    function setDeviceActive(
        bytes32 deviceId,
        bool active
    ) external onlyAdmin {
        require(devices[deviceId].registered, "Unknown device");

        devices[deviceId].active = active;

        emit DeviceStatusChanged(deviceId, active);
    }

    function setPermission(
        bytes32 deviceId,
        bytes32 resource,
        bool allowed
    ) external onlyAdmin {
        require(devices[deviceId].registered, "Unknown device");
        require(resource != bytes32(0), "Invalid resource");

        permissions[deviceId][resource] = allowed;

        emit PermissionUpdated(deviceId, resource, allowed);
    }

    function checkAccess(
        bytes32 deviceId,
        bytes32 credentialHash,
        bytes32 resource
    ) external returns (bool allowed) {
        Device storage device = devices[deviceId];

        allowed =
            device.registered &&
            device.active &&
            device.credentialHash == credentialHash &&
            permissions[deviceId][resource];

        emit AccessChecked(deviceId, resource, allowed);
    }

    function getDevice(bytes32 deviceId)
        external
        view
        returns (
            bool registered,
            bool active,
            uint256 registeredAt
        )
    {
        Device storage device = devices[deviceId];

        return (
            device.registered,
            device.active,
            device.registeredAt
        );
    }
}
