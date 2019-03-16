var KeyboxJS=require('./index');
let keybox=new KeyboxJS();


console.log(keybox.connect());
keybox.sendMessage('EccGetPublicKeyRequest',{ Hdpath: "bip32/m/48'/1'/1'/1'/2" }).then(res=> {

   console.log(res.getPubkey_asU8());

});

