const express = require('express')
const bodyParser = require('body-parser');

module.exports = class {
    constructor(port, network, store){
        this.app = express();
        this.app.use(bodyParser.json());

        this.app.use(express.static('./gui'))

        this.network = network;
        this.store = store;

        this.route_create();
        this.route_call();
        this.route_result();
        this.route_transactions_list();
        this.route_contracts_list();

        this.app.listen(port);
    }

    route_contracts_list(){
        this.app.post('/api/list_contracts', (req, res) => {
            // Send contract request to network.
            var ctrs = this.store.contracts_list()
        
            // console.log(req.body)
            res.send({success: true, data: ctrs});
        });
    }

    route_transactions_list(){
        this.app.post('/api/list_transactions', (req, res) => {
            // Send contract request to network.
            var ctrs = this.store.transactions_list()
        
            // console.log(req.body)
            res.send({success: true, data: ctrs});
        });
    }    

    route_create(){
        this.app.post('/api/create_contract', (req, res) => {
            if (!req.body.params)
                return res.send({success: false, message: "params not defined"})

            if (!req.body.params.code)
                return res.send({success: false, message: "param code not defined"})
        
            // Send contract request to network.
            // var cid = this.network.request_create(req.body.params.code);
            var cid = this.network.create_contract(req.body.params.code);
        
            res.send({success: true, id: cid});
        });
    }

    route_call(){
        this.app.post('/api/call_contract', (req, res) => {
            if (!req.body.params.cid)
                return res.send({success: false, message: "cid not defined"})
        
            // Send contract request to network.
            var txid = this.network.request_call(req.body.params.cid, req.body.params.method, req.body.params.args);
        
            res.send({success: true, id: txid});
        });        
    }

    route_result(){
        this.app.post('/api/tx_result', (req, res) => {
            if (!req.body.params.id)
                return res.send({success: false, message: "id not defined"})
        
            res.send({success: true, data: this.store.get_txres(req.body.params.id)});
        });        
    }    
}