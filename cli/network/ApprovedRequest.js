const md5 = require('md5')

module.exports = class {
    constructor(nw_logic, req, af, cb_req, cb_res) {
        this.nw_logic = nw_logic
        this.req = req
        this.af = af
        this.cb_req = cb_req
        this.cb_res = cb_res
        this.answers = {}

        // Сюда складываем подтверждения.
        this.approves = {};

        this.nw_logic.network.subscribe(req + '_req', (msg) => {
            console.log('Req ' + req + ' id:' + msg.id + ' requested by ' + msg.mac);
            if (this.nw_logic.network.mac == msg.mac)
            {
                console.log('Skip self');
                return;
            }

            if (this.cb_req(msg))
                this.nw_logic.network.send(req + '_res', msg);
            else
                this.nw_logic.network.send(req + '_rej', { id: msg.id });
        });

        this.nw_logic.network.subscribe(req + '_res', (msg) => {
            // Create contract and send approve (res) or reject (rej)
            console.log('Req ' + req + ' id:' + msg.id + ' approved by ' + msg.mac);

            if (this.nw_logic.network.mac == msg.mac) return;

            if (!this.approves[msg.id])
                this.approves[msg.id] = [];

            // die if there was approve from this mac
            if (this.approves[msg.id].includes(msg.mac)) return;
            this.approves[msg.id].push(msg.mac);

            if (!this.answers[msg.id])
                this.answers[msg.id] = [];

            var hash = md5(JSON.stringify(msg[af]))

            if (!this.answers[msg.id][hash]) this.answers[msg.id][hash] = 0;
            this.answers[msg.id][hash]++;

            // console.log('AprReq ', this.answers);
            if (this.answers[msg.id][hash] < this.nw_logic.approves_min) return;

            console.log('AprReq ' + req + ' id:' + msg.id + ' APPROVED by 51%!');

            this.cb_res(msg);
        });
    }

    send(data) {
        console.log('AprReq ')
        // this.approves = {}
        // this.answers = {}

        data.id = this.nw_logic.network.gen_id();
        console.log('AprReq ' + this.req + ' id:' + data.id + ' sended');
        this.nw_logic.network.send(this.req + '_req', data);
        return data.id
    }
}