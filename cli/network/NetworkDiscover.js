module.exports = class {
    constructor(network, node_pool) {
        this.network = network
        this.pool = node_pool

        this.network.subscribe('DISCOVER_REQ', msg => {
            // discover network at least 10 sec
            this.network.send('DISCOVER_RES', {mac: this.network.mac, decKey: this.pool.decKey })
        })

        // discover network min 10 sec
        this.network.subscribe('DISCOVER_RES', msg => {
            this.pool.append(msg.mac, null, msg.decKey)
        })        
    }

    discover(timeout_sec) {
        return new Promise((resolve, reject) => {
            timeout_sec = timeout_sec || 3
            setTimeout(() => resolve(), timeout_sec * 1000)
            this.network.send('DISCOVER_REQ')        
        })
    }
}