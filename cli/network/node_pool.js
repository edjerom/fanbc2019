const Node = require('./node')

module.exports = class {
    constructor(store) {
        this.reset();
        this.node = new Node(store.sub('node'))
    }

    reset() {
        this.nodes = {};
    }

    append(mac, key) {
        if (this.nodes[mac]) {
            console.log("Node " + mac + " already discovered")
            return;
        }

        console.log("Node " + mac + " added")

        this.nodes[mac] =  new Node(key)
    }

    encrypt(data){
        return this.node.encrypt(data);
    }

    decrypt(msg) {
        console.log('decrypt', msg, this.nodes)
        var n = this.nodes[msg.mac]
        if (!n) {
            console.log("Node " + msg.mac + " not registered")
            return false;
        }

        try {
            // var key = new NodeRSA();
            // key.importKey(n.decKey)

            return n.decrypt(msg.enc);
        }
        catch (ex) {
            console.log("Key error with node " + msg.mac)
            return false;
        }
    }

    approves_min(){
        return Math.floor(this.nodes.length / 2) + 1;
    }
}