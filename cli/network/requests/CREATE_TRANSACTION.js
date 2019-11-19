module.exports = {
    requested(msg, nl){
        nl.transactions.create_transaction(msg.id, msg.data.cid, msg.data.method, msg.data.args);
        return true;
    },

    approved(msg, nl){
        nl.buildAR('RUN_TRANSACTION').send({id: msg.id, data: {txid:msg.id}}, true)
        return true;
    }
}