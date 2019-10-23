module.exports = class {
    constructor(nw_logic, req, cb_req, cb_res) {
        this.nw_logic = nw_logic
        this.req = req
        this.cb_req = cb_req
        this.cb_res = cb_res

        // Сюда складываем подтверждения.
        this.approves = {};

        this.nw_logic.network.subscribe(req + '_req', (msg) => {
            console.log('Req ' + req + ' id:' + msg.id + ' requested by ' + msg.mac);
            if (this.cb_req(msg))
                this.nw_logic.network.send(req + '_res', { id: msg.id });
            else
                this.nw_logic.network.send(req + '_rej', { id: msg.id });
        });

        this.nw_logic.network.subscribe(req + '_res', (msg) => {
            // Create contract and send approve (res) or reject (rej)
            console.log('Req ' + req + ' id:' + msg.id + ' approved by ' + msg.mac);

            if (!this.approves[msg.id])
                this.approves[msg.id] = [];

            // die if there was approve from this mac
            if (this.approves[msg.id].includes(msg.mac)) return;

            this.approves[msg.id].push(msg.mac);
console.log(this.nw_logic.approves_min)
            if (this.approves[msg.id].length < this.nw_logic.approves_min) return;

            console.log('Req ' + req + ' id:' + msg.id + ' APPROVED!');

            if (!this.cb_res(msg)) return;
        });
    }

    send(data) {
        data.id = this.nw_logic.network.gen_id();
        console.log('Req ' + this.req + ' id:' + data.id + ' sended');
        this.nw_logic.network.send(this.req + '_req', data);
        return data.id
    }
}