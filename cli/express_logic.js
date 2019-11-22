const express = require('express')
const bodyParser = require('body-parser');

module.exports = class {
    constructor(port, nl, store){
        this.app = express();
        this.app.use(bodyParser.json());

        this.app.use(express.static('./gui'))
        this.app.use('/mfc', express.static('./gui_mfc'))

        this.nl = nl;
        this.store = store;

        this.route_create();
        this.route_call();
        this.route_result();
        this.route_transactions_list();
        this.route_contracts_list();

        this.app.post('/api/sys/nodes', (req, res) => {
            res.send({success: true, data: Object.keys(this.nl.keystore.keys)});
        });        

        this.app.post('/api/data/:id', (req, res) => {
            res.send({success: true, data: this.nl.contracts.data(req.params.id)});
        });       

        this.app.listen(port);
    }

    route_contracts_list(){
        this.app.post('/api/list_contracts', (req, res) => {
            // Send contract request to network.
            var ctrs = this.nl.contracts.store_ena.files()
        
            // console.log(req.body)
            res.send({success: true, data: ctrs});
        });
    }

    route_transactions_list(){
        this.app.post('/api/list_transactions', (req, res) => {
            // Send contract request to network.
            var files = this.nl.transactions.store.files()
            var ctrs = files.map(f => this.nl.transactions.store.load(f))
        
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
            var cid = this.nl.create_contract(req.body.params.code);
        
            res.send({success: true, id: cid});
        });
    }

    route_call(){
        this.app.post('/api/call_contract', (req, res) => {
            if (!req.body.params.cid)
                return res.send({success: false, message: "cid not defined"})
        
            // Send contract request to network.
            var txid = this.nl.create_transaction(req.body.params.cid, req.body.params.method, req.body.params.args);
        
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