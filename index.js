var usb = require('usb');
var messages = require('./lib/messages_pb');
const MessageTypes =require('./lib/messagetypes');

class KeyboxJS {

    constructor() {
        this.vid = 46763;
        this.pid = 47851;
        this.connected = false;
    }
    connect() {
        this.device = usb.findByIds(this.vid, this.pid);
        if (this.device == null) {
            return false;
        } else {
            this.device.open();
            this.iface = this.device.interface(0);
            this.iface.claim();
            this.tx = this.iface.endpoint(2);
            this.rx = this.iface.endpoint(129);
            this.connected = true;
            return true;
        }
    }
    reset() {
        let buffer = Buffer.alloc(1024);
        buffer.writeUInt8(0x5, 0);
        return new Promise((resolve, reject) => {
            this.tx.transfer(buffer, function (data) {
                this.rx.transfer(1024, function (error, data) {
                    if (error) {
                        throw error;
                    }
                    if (data.readUInt8(0) == 0x4) {
                        resolve();
                    } else {
                        reject();
                    }
                });
            });
        });
    }
    async sendMessage(messageType,props) {
        let self=this;
        let requestType=this.messageFromName(messageType);
        
        let msg =new messages[requestType.name]();
        for(let prop in props) {
            msg['set'+prop](props[prop]);
        }
        let bytes = msg.serializeBinary();
        let buffer = Buffer.alloc(1024);
        if (bytes.length <= 1015) {
            let msglength=bytes.length;
            buffer.writeUInt8(0x1, 0);
            buffer.writeUInt32BE(requestType.id, 1);
            buffer.writeUInt32BE(msglength, 5);
            Buffer.from(bytes).copy(buffer,9);            
            await this._sendSingleMessage(buffer);
        }else{
            throw new Error('Long messages (>1015) not implemented yet');
        }
        try {
            let data= await this._receive(1024);
            let response;
            if (data.readUInt8(0) == 1) {
                response=this._receiveSingleMessage(data);
            }else{
                if (data.readUInt8(0) == 2) {
                    response=this._receiveMultiMessage(data);
                }else{
                    this.reset();
                    throw new Error('Unexpected response');
                }
            }
            return response;
        }catch(e) {
            this.reset();
            throw new Error(e);
        }
    }
    _sendSingleMessage(buffer) {
        return this._send(buffer);
    }
    _receiveSingleMessage(data) {
        let msgType=this.messageFromType(data.readUInt32BE(1));
        
        let msgLength=data.readUInt32BE(5);
        
        let message=data.slice(9,msgLength+9);
        
        
        let msgObject=messages[msgType.name].deserializeBinary(message);
        return(msgObject);
    }    
    _sendMultiMessage() {

    }
    _send(bytes) {
        return new Promise((resolve,reject) => {
            this.tx.transfer(bytes,resolve) 
        });
    }
    _receive(size) {
        return new Promise((resolve,reject) => {
            this.rx.transfer(size,function(error,data) {
                if (error) {
                    reject(error);
                }else{
                    resolve(data);
                }
            });
        });
    }
    async _receiveMultiMessage(data) {
        let msgType=this.messageFromType(data.readUInt32BE(1));
        let msgLength=data.readUInt32BE(5);
        let message=data.slice(9);
        let count=0;
        while(message.length<msgLength) {
            await this._sendAck(1015+count*1019);
            let _part=await this._receive(1024);
            let _msgpart;
            if (_part.readUInt8(0)==0x3) {
                if ((message.length+1019)>msgLength) {
                    _msgpart=_part.slice(5);
                }else{
                    _msgpart=_part.slice(5,5+(msgLength-(1015+count*1019)));
                }
            }else{
                throw new Error('Unexpected rx code');
            }
            message=Buffer.concat([message,_msgpart]);
            count++;
        }
        let msgObject=messages[msgType.name].deserializeBinary(message).toObject()
        return message;
        
    }
    _sendAck(offset) {
        return new Promise((resolve,reject)=> {
            let buffer = Buffer.alloc(1024);
            buffer.writeUInt8(0x4, 0);
            buffer.writeUInt32BE(offset, 1);
            this.tx.transfer(buffer, resolve);
        });
    }
    messageFromType(msgtype) {
        for(let type in MessageTypes) {
            if (MessageTypes[type].id==msgtype) {
                return MessageTypes[type];
            }
        }
    }
    messageFromName(msgtype) {
        for(let type in MessageTypes) {
            if (MessageTypes[type].name==msgtype) {
                return MessageTypes[type];
            }
        }
    }
}
module.exports=KeyboxJS;