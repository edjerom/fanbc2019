module.exports = {
    requested(msg, nl){
        msg.data = nl.transactions.store.load_raw(msg.did)
        return true;
    },

    approved(msg, nl){
        nl.transactions.store.save_raw(msg.did, msg.data)
    }
}