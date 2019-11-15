module.exports = {
    requested(msg, nl){
        nl.transactions.create_transaction(msg.id, msg.data.cid, msg.data.method, msg.data.args);
        return true;
    },

    approved(msg, nl){
        nl.transactions.run_transaction(msg.id)
        return true;
    }
}