const Datastore = require('nedb');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Make sure the data directory exists
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Create datastores for each collection
const db = {
  users: new Datastore({ 
    filename: path.join(dataDir, 'users.db'), 
    autoload: true 
  }),
  jobs: new Datastore({ 
    filename: path.join(dataDir, 'jobs.db'), 
    autoload: true 
  })
};

// Create indexes
db.users.ensureIndex({ fieldName: 'name' });
db.jobs.ensureIndex({ fieldName: 'title' });
db.jobs.ensureIndex({ fieldName: 'company' });

// Promise wrappers for NeDB functions
const connectDB = () => {
  console.log('NeDB connected. Data stored in:', dataDir);
  
  // Return empty object to mimic mongoose connection
  return { connection: { host: 'local-nedb' } };
};

// Create a mongoose-like model interface
const createModel = (collection) => {
  return {
    find: (query = {}) => {
      return new Promise((resolve, reject) => {
        db[collection].find(query, (err, docs) => {
          if (err) return reject(err);
          resolve(docs);
        });
      });
    },
    findById: (id) => {
      return new Promise((resolve, reject) => {
        db[collection].findOne({ _id: id }, (err, doc) => {
          if (err) return reject(err);
          resolve(doc);
        });
      });
    },
    create: (data) => {
      return new Promise((resolve, reject) => {
        db[collection].insert(data, (err, doc) => {
          if (err) return reject(err);
          resolve(doc);
        });
      });
    },
    insertMany: (data) => {
      return new Promise((resolve, reject) => {
        db[collection].insert(data, (err, docs) => {
          if (err) return reject(err);
          resolve(docs);
        });
      });
    },
    updateOne: (query, update) => {
      return new Promise((resolve, reject) => {
        db[collection].update(query, { $set: update }, {}, (err, numAffected) => {
          if (err) return reject(err);
          resolve({ nModified: numAffected });
        });
      });
    },
    deleteOne: (query) => {
      return new Promise((resolve, reject) => {
        db[collection].remove(query, {}, (err, numRemoved) => {
          if (err) return reject(err);
          resolve({ deletedCount: numRemoved });
        });
      });
    },
    deleteMany: (query) => {
      return new Promise((resolve, reject) => {
        db[collection].remove(query, { multi: true }, (err, numRemoved) => {
          if (err) return reject(err);
          resolve({ deletedCount: numRemoved });
        });
      });
    }
  };
};

module.exports = {
  connectDB,
  db,
  models: {
    User: createModel('users'),
    Job: createModel('jobs')
  }
};
