const { v4: uuidv4 } = require("uuid");
const { models } = require("../db/nedb-connection");

class User {
  constructor(data = {}) {
    this._id = data._id || uuidv4();
    this.name = data.name;
    this.skills = data.skills || [];
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  static fromDoc(doc) {
    if (!doc) return null;
    return new User(doc);
  }

  static async find(query = {}) {
    const docs = await models.User.find(query);
    return docs.map((d) => User.fromDoc(d));
  }

  static async findById(id) {
    const doc = await models.User.findById(id);
    return User.fromDoc(doc);
  }

  static async create(data) {
    const user = new User(data);
    const result = await models.User.create(user);
    return User.fromDoc(result);
  }

  async save() {
    this.updatedAt = new Date();

    const exists = await models.User.findById(this._id);
    if (exists) {
      await models.User.updateOne({ _id: this._id }, this);
      return this;
    } else {
      const result = await models.User.create(this);
      return User.fromDoc(result);
    }
  }

  async deleteOne() {
    return await models.User.deleteOne({ _id: this._id });
  }

  static async deleteMany(query = {}) {
    return await models.User.deleteMany(query);
  }

  static async insertMany(docs) {
    const users = docs.map((doc) => new User(doc));
    const res = await models.User.insertMany(users);
    return res.map((d) => User.fromDoc(d));
  }
}

module.exports = User;
