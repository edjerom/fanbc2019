const fs = require('fs')
const md5 = require('md5');

module.exports = class {
    constructor(path) {
        this.path = path
        this.data = {}
    }

    load() {
        try {
            if (fs.existsSync(this.path)){
                this.data = JSON.parse(fs.readFileSync(this.path))
            }
        }
        catch (ex) { }
    }

    save() {
        fs.writeFileSync(this.path, JSON.stringify(this.data));
    }

    hash() {
        return md5(fs.existsSync(path) ? fs.readFileSync(path) : "dummy");
    }
}