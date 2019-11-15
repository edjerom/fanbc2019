module.exports = {
    requested(msg, nl){
        console.log('#CREATED')
        nl.contracts.create_contract(msg.id, msg.data.code);
        return true;
    },

    approved(msg, nl){
        console.log('#ENABLED')
        nl.contracts.enable_contract(msg.id);
        return true;
    }
}