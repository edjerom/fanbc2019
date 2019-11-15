module.exports = {
    requested(msg, nl){
        // console.log('#init WOW requested', msg)
        msg.data = {
            crs: nl.contracts.store_ena.files(),
            trs: nl.transactions.store.files(),
            dss: nl.contracts.store_data.files()
        }
        return true;
    },

    approved(msg, nl){
        // console.log('#init approved as ', msg)
        for (var k in msg.data.crs){
            nl.buildAR('INIT_CT').send({did: msg.data.crs[k]})
        }        

        for (var k in msg.data.trs){
            nl.buildAR('INIT_TX').send({did: msg.data.trs[k]})
        }       

        for (var k in msg.data.dss){
            nl.buildAR('INIT_DS').send({did: msg.data.dss[k]})
        }       
    }
}