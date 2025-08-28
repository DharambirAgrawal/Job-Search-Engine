# Job Search Engine

A backend-focused job matching system that demonstrates system design, algorithmic thinking, and software engineering skills. This project focuses on matching users to jobs based on skill similarity, providing search functionality, and modeling skill relationships using a graph.

## 🎯 Features

- **Skill-Based Job Matching:** Matches users to jobs using Jaccard similarity and other scoring algorithms
- **Job Search:** Implements an inverted index for efficient text-based job searching
- **Skill Graph:** Models relationships between skills for recommendations and upskilling paths
- **RESTful API:** Clean API endpoints for all functionality
- **Modular Architecture:** Separation of concerns with well-defined services

## 🛠️ Tech Stack

- **Backend:** Node.js with Express
- **Database:** NeDB (File-based, MongoDB-compatible)
- **Testing:** Jest

## 🏗️ Architecture

The system is built with a modular, service-oriented architecture:

### Core Services

1. **Matcher Service**
   - Compares user skills with job requirements
   - Implements multiple similarity algorithms (Jaccard, simple overlap)
   - Returns ranked job matches

2. **Search Service**
   - Builds and maintains an inverted index for job data
   - Provides keyword-based search functionality
   - Falls back to text search when needed

3. **Skill Graph Service**
   - Maintains a directed graph of skill relationships
   - Provides skill recommendations based on current skills
   - Finds upskilling paths between skills

### Data Models

1. **User**
   ```json
   {
     "id": "uuid",
     "name": "Alice",
     "skills": ["React", "Node.js", "MongoDB"]
   }
   ```

2. **Job**
   ```json
   {
     "id": "uuid",
     "title": "Frontend Developer",
     "description": "We are looking for a React developer...",
     "requiredSkills": ["React", "TypeScript", "HTML", "CSS"],
     "location": "Remote",
     "company": "TechCorp"
   }
   ```

## 🚀 API Endpoints

| Method | Route                | Description                     |
|--------|----------------------|---------------------------------|
| POST   | `/api/users`         | Add a user with skills          |
| GET    | `/api/users`         | Get all users                   |
| GET    | `/api/users/:id`     | Get user by ID                  |
| PUT    | `/api/users/:id`     | Update user                     |
| DELETE | `/api/users/:id`     | Delete user                     |
| POST   | `/api/jobs`          | Add a job listing               |
| GET    | `/api/jobs`          | Get all jobs                    |
| GET    | `/api/jobs/:id`      | Get job by ID                   |
| PUT    | `/api/jobs/:id`      | Update job                      |
| DELETE | `/api/jobs/:id`      | Delete job                      |
| GET    | `/api/match/:userId` | Return top job matches for user |
| GET    | `/api/search?q=term` | Keyword search jobs             |
| GET    | `/api/skills`        | Get all skills in the system    |
| GET    | `/api/skills/related/:skill` | Get related skills      |
| POST   | `/api/skills/recommend` | Recommend skills based on current skills |
| GET    | `/api/skills/path?from=X&to=Y` | Find path between skills |

## 🧪 Algorithms

### Skill Matching

The system implements multiple algorithms for matching users to jobs:

1. **Jaccard Similarity**
   ```javascript
   function jaccardSimilarity(userSkills, jobSkills) {
     const userSet = new Set(userSkills);
     const jobSet = new Set(jobSkills);
     
     const intersection = new Set([...userSet].filter(skill => jobSet.has(skill)));
     const union = new Set([...userSet, ...jobSet]);
     
     return intersection.size / union.size;
   }
   ```

2. **Simple Match Score**
   ```javascript
   function matchScore(userSkills, jobSkills) {
     const matched = jobSkills.filter(skill => userSkills.includes(skill));
     return matched.length / jobSkills.length;
   }
   ```

### Search

The search service implements a simple inverted index:

1. Maps tokens to job IDs
2. Tokenizes job titles, descriptions, and skills
3. Efficiently retrieves matching jobs for a query

## 🚀 Getting Started

### Prerequisites

- Node.js (v14+)

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/DharambirAgrawal/Job-Search-Engine.git
   cd Job-Search-Engine
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Set up environment variables
   ```
   Create a .env file with:
   PORT=3000
   NODE_ENV=development
   DB_TYPE=local
   ```

4. Run the server
   ```bash
   npm run dev
   ```

5. Run tests
   ```bash
   npm test
   ```

## 📚 API Usage Examples

### Add a User

```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name": "Alice Smith", "skills": ["JavaScript", "React", "Node.js", "HTML", "CSS"]}'
```

### Add a Job

```bash
curl -X POST http://localhost:3000/api/jobs \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Frontend Developer",
    "description": "We are looking for a React developer...",
    "requiredSkills": ["React", "TypeScript", "HTML", "CSS"],
    "location": "Remote",
    "company": "TechCorp"
  }'
```

### Get Matches for a User

```bash
curl http://localhost:3000/api/match/user_id_here
```

### Search for Jobs

```bash
curl http://localhost:3000/api/search?q=frontend
```

## 📝 Future Enhancements

- Redis caching for recent searches
- Rate limiting using middleware
- More comprehensive test coverage
- Trie-based search autocomplete
- ML-based skill extraction from job descriptions