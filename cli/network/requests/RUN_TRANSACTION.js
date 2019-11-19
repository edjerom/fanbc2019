module.exports = {
    requested(msg, nl){
        nl.transactions.run_transaction(msg.id)
        return true;
    },

    approved(msg, nl){
        // nl.transactions.run_transaction(msg.id)
        return true;
    }
}