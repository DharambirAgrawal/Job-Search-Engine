const { v4: uuidv4 } = require('uuid');
const { models } = require('../db/nedb-connection');

class User {
  constructor(data) {
    this._id = data._id || uuidv4();
    this.name = data.name;
    this.skills = data.skills || [];
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  static async find(query = {}) {
    const docs = await models.User.find(query);
    return docs;
  }

  static async findById(id) {
    const doc = await models.User.findById(id);
    return doc;
  }

  static async create(data) {
    const user = new User(data);
    const result = await models.User.create(user);
    return result;
  }

  async save() {
    this.updatedAt = new Date();
    
    if (await models.User.findById(this._id)) {
      await models.User.updateOne({ _id: this._id }, this);
      return this;
    } else {
      const result = await models.User.create(this);
      return result;
    }
  }

  async deleteOne() {
    return await models.User.deleteOne({ _id: this._id });
  }

  static async deleteMany(query = {}) {
    return await models.User.deleteMany(query);
  }

  static async insertMany(docs) {
    const users = docs.map(doc => new User(doc));
    return await models.User.insertMany(users);
  }
}

module.exports = User;

module.exports = User;
