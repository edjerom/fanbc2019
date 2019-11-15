module.exports = {
    requested(msg, nl){
        msg.data = nl.contracts.store_data.load_raw(msg.did)
        return true;
    },

    approved(msg, nl){
        nl.contracts.store_data.save_raw(msg.did, msg.data)
    }
}