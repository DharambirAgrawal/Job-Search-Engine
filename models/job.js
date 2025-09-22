const { v4: uuidv4 } = require("uuid");
const { models } = require("../db/nedb-connection");

class Job {
  constructor(data = {}) {
    this._id = data._id || uuidv4();
    this.title = data.title;
    this.description = data.description;
    // Accept either `skills` (frontend) or `requiredSkills` (legacy)
    this.skills = data.skills || data.requiredSkills || [];
    // keep backward-compatible field as well
    this.requiredSkills = this.skills;
    this.location = data.location;
    this.company = data.company;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  // Helper to convert a plain doc into a Job instance
  static fromDoc(doc) {
    if (!doc) return null;
    return new Job(doc);
  }

  static async find(query = {}) {
    const docs = await models.Job.find(query);
    // return array of Job instances
    return docs.map((d) => Job.fromDoc(d));
  }

  static async findById(id) {
    const doc = await models.Job.findById(id);
    return Job.fromDoc(doc);
  }

  static async create(data) {
    const job = new Job(data);
    const result = await models.Job.create(job);
    return Job.fromDoc(result);
  }

  async save() {
    this.updatedAt = new Date();
    // keep requiredSkills in sync with skills
    this.requiredSkills = this.skills;

    const exists = await models.Job.findById(this._id);
    if (exists) {
      await models.Job.updateOne({ _id: this._id }, this);
      return this;
    } else {
      const result = await models.Job.create(this);
      return Job.fromDoc(result);
    }
  }

  async deleteOne() {
    return await models.Job.deleteOne({ _id: this._id });
  }

  static async deleteMany(query = {}) {
    return await models.Job.deleteMany(query);
  }

  static async insertMany(docs) {
    const jobs = docs.map((doc) => new Job(doc));
    const res = await models.Job.insertMany(jobs);
    return res.map((d) => Job.fromDoc(d));
  }
}

module.exports = Job;
