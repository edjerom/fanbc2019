module.exports = function (path, method, args, dsnode){
    console.log('patyh is:', path );
        var ctr = require(path)
        console.log(ctr);
        var c = new ctr();
        console.log('dsnode is', dsnode)

        c.ds = dsnode;
        console.log('c.ds is', c.ds)
        // Do tx
        console.log('class is', c);
        console.log('c.method is', method);

        var res = c[method](args);
        console.log('tx res is', res);
        return res;
}
