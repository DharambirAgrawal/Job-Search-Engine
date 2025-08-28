const { v4: uuidv4 } = require('uuid');
const { models } = require('../db/nedb-connection');

class Job {
  constructor(data) {
    this._id = data._id || uuidv4();
    this.title = data.title;
    this.description = data.description;
    this.requiredSkills = data.requiredSkills || [];
    this.location = data.location;
    this.company = data.company;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  static async find(query = {}) {
    const docs = await models.Job.find(query);
    return docs;
  }

  static async findById(id) {
    const doc = await models.Job.findById(id);
    return doc;
  }

  static async create(data) {
    const job = new Job(data);
    const result = await models.Job.create(job);
    return result;
  }

  async save() {
    this.updatedAt = new Date();
    
    if (await models.Job.findById(this._id)) {
      await models.Job.updateOne({ _id: this._id }, this);
      return this;
    } else {
      const result = await models.Job.create(this);
      return result;
    }
  }

  async deleteOne() {
    return await models.Job.deleteOne({ _id: this._id });
  }

  static async deleteMany(query = {}) {
    return await models.Job.deleteMany(query);
  }

  static async insertMany(docs) {
    const jobs = docs.map(doc => new Job(doc));
    return await models.Job.insertMany(jobs);
  }
}

module.exports = Job;
