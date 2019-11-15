const NodeRSA = require('node-rsa');
const key = new NodeRSA({b: 512});
 
const text = 'Hello RSA!';
var encrypted = key.encrypt(text, 'base64');
console.log('encrypted: ', encrypted);
var decrypted = key.decrypt(encrypted, 'utf8');
console.log('decrypted: ', decrypted);

var pub = key.exportKey('public')
var pri = key.exportKey('private')

var keyPub = new NodeRSA()
keyPub.importKey(pub)

var keyPri = new NodeRSA()
keyPri.importKey(pri)

encrypted = keyPub.encrypt(text, 'base64');
console.log('encrypted: ', encrypted);
decrypted = keyPri.decrypt(encrypted, 'utf8');
console.log('decrypted: ', decrypted);