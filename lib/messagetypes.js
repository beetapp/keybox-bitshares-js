const MessageTypes = {
    MsgTypeLowLimit: {
        id: 0,
        name: 'LowLimit'
    },
    MsgTypeGenericConfirmReply: {
        id: 1,
        name: 'GenericConfirmReply'
    },
    MsgTypeRequestRejected: {
        id: 2,
        name: 'RequestRejected'
    },
    MsgTypeGetModeAndVersionRequst : {
        id: 3,
        name: 'GetModeAndVersionRequst'
    },
    MsgTypeGetModeAndVersionReply : {
        id: 4,
        name: 'GetModeAndVersionReply'
    },
    MsgTypeWriteSerialNoRequest : {
        id: 5,
        name: 'WriteSerialNoRequest'
    },
    MsgTypeWriteSerialNoReply : {
        id: 6,
        name: 'WriteSerialNoReply'
    },
    MsgTypeLockSerialNoRequest : {
        id: 7,
        name: 'LockSerialNoRequest'
    },
    MsgTypeEraseDataRequest : {
        id: 8,
        name: 'EraseDataRequest'
    },
    MsgTypeLockSerialNoReply : {
        id: 9,
        name: 'LockSerialNoReply'
    },
    MsgTypeUpgradeStartRequest : {
        id: 10,
        name: 'UpgradeStartRequest'
    },
    MsgTypeSendUpgradeFirmware : {
        id: 11,
        name: 'SendUpgradeFirmware'
    },
    MsgTypeEccSignRequest: {
        id: 15,
        name: 'EccSignRequest'
    },
    MsgTypeEccSignResult : {
        id: 16,
        name: 'EccSignResult'
    },
    MsgTypeEccGetPublicKeyRequest : {
        id: 17,
        name: 'EccGetPublicKeyRequest'
    },
    MsgTypeEccGetPublicKeyReply : {
        id: 18,
        name: 'EccGetPublicKeyReply'
    },
    MsgTypeEccMultiplyRequest : {
        id: 19,
        name: 'EccMultiplyRequest'
    },
    MsgTypeEccMultiplyReply : {
        id: 20,
        name: 'EccMultiplyReply'
    },
    MsgTypeHighLimit: {
        id: 21,
        name: 'HighLimit'
    }
}
module.exports = MessageTypes;