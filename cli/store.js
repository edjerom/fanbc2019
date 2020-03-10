const fs = require('fs')
const bigInt = require('big-integer')
const md5file = require('md5-file')
const md5 = require('md5')

var Store = class {
    constructor(name, path) {
        this._path = (path || "./") + (name || "_store") + "/"

        if (!fs.existsSync(this._path)) fs.mkdirSync(this._path);
    }

    sub(name) {
        return new Store(name, this._path);
    }


    exists(name) {
        return fs.existsSync(this.path(name))
    }

    path(name) {
        return this._path + name;
    }

    drop(name) {
        fs.unlinkSync(this.path(name))
    }


    load_raw(name) {
        return fs.existsSync(this.path(name)) ? fs.readFileSync(this.path(name)).toString() : "{}";
    }

    save_raw(name, data) {
        fs.writeFileSync(this.path(name), data);
    }

    load(name) {
        return JSON.parse(this.load_raw(name))
    }

    save(name, data) {
        this.save_raw(name, JSON.stringify(data))
    }


    /**
     * Получить все файлы хранилища.
     */
    files() {
        return this.all().filter(file => !fs.statSync(this._path + file).isDirectory())
    }

    /**
     * Получить все папки хранилища.
     */
    dirs() {
        return this.all().filter(file => fs.statSync(this._path + file).isDirectory())
    }

    /**
     * Получить все файлы и папки хранилища.
     */
    all() {
        return fs.readdirSync(this._path)
    }

    db_hash() {
        var ents = fs.readdirSync(this._path, {withFileTypes: true})
        var dirs = ents.filter(d => d.isDirectory()) 
        var dirs = ents.filter(d => !d.isDirectory())




        // return (bi1 + bi2).toString(36)

        return md5(this._dir_hash(this._path).toString(36))
        // return fs.readdirSync(this._path)
        // return '123456789';
    }

    _dir_hash(dir, skip){
        var skip = ['keys']
        var ents = fs.readdirSync(dir, {withFileTypes: true}).filter(x => !skip.includes(x.name))
        var dirs = ents.filter(d => d.isDirectory()) 
        var files = ents.filter(d => !d.isDirectory())

        var fh = files.reduce((sum, f) => { sum += bigInt(md5file.sync(dir + f.name), 36); return sum }, bigInt(0, 36))
        var dh = dirs.reduce((sum, f) => { sum += this._dir_hash(dir + f.name + '/'); return sum }, bigInt(0, 36))

        // console.log(files)
        return fh + dh
    }
}

module.exports = Store