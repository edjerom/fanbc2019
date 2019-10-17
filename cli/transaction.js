module.exports = function (path, args, dsnode){
        var ctr = require(path)
        // Do tx
        ctr(dsnode, args);
}