const KeyboxJS = require('./index');
let keybox = new KeyboxJS();
const bs58 = require('bs58');
const EC = require('elliptic').ec;
const createHash = require('create-hash');
var messages = require('./lib/messages_pb');
var {
    Apis
} = require("bitsharesjs-ws");
var {
    TransactionBuilder
} = require("bitsharesjs");


// Create and initialize EC context
// (better do it once and reuse it)
var ec = new EC('secp256k1');

console.log(keybox.connect());
keybox.sendMessage('EccGetPublicKeyRequest', {
    Hdpath: "bip32/m/48'/1'/1'/1'/2"
}).then(async res => {

    let pubkey = '04' + Buffer.from(res.getPubkey_asU8()).toString('hex');
    var key = ec.keyFromPublic(pubkey, 'hex');
    var pubPoint = key.getPublic();
    let compressed = pubPoint.getX().toString('hex');
    if (parseInt(compressed[compressed.length - 1], 16) % 2 == 0) {
        compressed = '02' + compressed;
    } else {
        compressed = '03' + compressed;
    }
    let compKey = Buffer.from(compressed, 'hex');
    var checksum = createHash("rmd160").update(compKey).digest();
    let addy = Buffer.concat([compKey, checksum.slice(0, 4)]);
    let btskey = 'BTS' + bs58.encode(addy);
    console.log(btskey);

    let fromAccount = '1.2.711128' // clockwork
    let toAccount = '1.2.1152309' //beet
    let amount = 100000 // 1 BTS
    let node = await Apis.instance("wss://bts-seoul.clockwork.gr", true).init_promise;

    let chain_id = Buffer.from(node[0].network.chain_id, 'hex');
    let tr = new TransactionBuilder();
    tr.add_type_operation("transfer", {
        fee: {
            amount: 0,
            asset_id: "1.3.0"
        },
        from: fromAccount,
        to: toAccount,
        amount: {
            amount: amount,
            asset_id: "1.3.0"
        }
    });
    await tr.set_required_fees();
    await tr.finalize();
    let tosign = Buffer.concat([chain_id, tr.tr_buffer]);
    let tosignhash = createHash("sha256").update(tosign).digest();
    let hash = new Uint8Array(tosignhash);
    let msg = new messages['EccSignOptions']();
    msg.setRfc6979(true);
    msg.setGrapheneCanonize(true);

    keybox.sendMessage('EccSignRequest', {
        Hdpath: "bip32/m/48'/1'/1'/1'/2",
        Algorithm: 0,
        Hash: hash,
        Options: msg

    }).then(res => {
        console.log(res);
        let r = Buffer.from(res.getR());
        let s = Buffer.from(res.getS());
        let v= res.getRecoverParam();
        let vbuff=Buffer.alloc(1);
        vbuff.writeUInt8(v+31);
        let signature = Buffer.concat([vbuff, r, s]).toString('hex');
        let tx = tr.toObject();
        tx.signatures.push(signature);

        Apis.instance()
            .network_api()
            .exec("broadcast_transaction_with_callback", [
                function (res) {
                    console.log(res);
                },
                tx
            ])
            .catch((e) => {
                console.log(e);
                throw new Error(e.toString());
            });
    });

});