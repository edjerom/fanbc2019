const fs = require('fs')

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
        return '123456789';
    }
}

module.exports = Store