module.exports = class {
    constructor(network, req, cb_req, cb_res) {
        this.network = network
        this.req = req
        this.cb_req = cb_req
        this.cb_res = cb_res

        // Сколько подтверждений надо получить чтобы считать что большинство за.
        this.approves_min = 1;
        // Сюда складываем подтверждения.
        this.approves = {};

        this.network.subscribe(req + '_req', (msg) => {
            console.log('Req ' + req + ' id:' + msg.id + ' requested by ' + msg.mac);
            if (this.cb_req(msg))
                this.network.send(req + '_res', { id: msg.id });
            else
                this.network.send(req + '_rej', { id: msg.id });
        });

        this.network.subscribe(req + '_res', (msg) => {
            // Create contract and send approve (res) or reject (rej)
            console.log('Req ' + req + ' id:' + msg.id + ' approved by ' + msg.mac);

            if (!this.approves[msg.id])
                this.approves[msg.id] = [];

            // die if there was approve from this mac
            if (this.approves[msg.id].includes(msg.mac)) return;

            this.approves[msg.id].push(msg.mac);

            if (this.approves[msg.id].length < this.approves_min) return;

            console.log('Req ' + req + ' id:' + msg.id + ' APPROVED!');

            if (!this.cb_res(msg)) return;
        });
    }

    send(data) {
        data.id = this.network.gen_id();
        console.log('Req ' + this.req + ' id:' + data.id + ' sended');
        this.network.send(this.req + '_req', data);
        return data.id
    }
}