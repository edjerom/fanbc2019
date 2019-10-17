const express = require('express')
const bodyParser = require('body-parser');

module.exports = class {
    constructor(port, network){
        this.app = express();
        this.app.use(bodyParser.json());

        this.network = network;
        // this.strore = store;

        this.route_create();
        this.route_call();

        this.app.listen(port);
    }

    route_create(){
        this.app.post('/create_contract', (req, res) => {
            if (!req.body.params.code)
                return res.send({success: false, message: "param code not defined"})
        
            // Send contract request to network.
            var cid = this.network.request_create(req.body.params.code);
        
            console.log(req.body)
            res.send({success: true, id: cid});
        });
    }

    route_call(){
        this.app.post('/call_contract', (req, res) => {
            if (!req.body.params.cid)
                return res.send({success: false, message: "cid not defined"})
        
            // Send contract request to network.
            var txid = this.network.request_call(req.body.params.cid, req.body.params.args);
        
            res.send({success: true, id: txid});
        });        
    }
}