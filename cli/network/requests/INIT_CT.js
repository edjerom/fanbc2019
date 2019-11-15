module.exports = {
    requested(msg, nl){
        msg.data = nl.contracts.store_ena.load_raw(msg.did)
        return true;
    },

    approved(msg, nl){
        // console.log('#SAVE contract', msg)
        nl.contracts.store_ena.save_raw(msg.did, msg.data)
    }
}