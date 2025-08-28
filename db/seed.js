const { connectDB } = require('../db/nedb-connection');
const User = require('../models/user');
const Job = require('../models/job');
require('dotenv').config();

/**
 * Seed the database with initial data for development and testing
 */
const seedDatabase = async () => {
  try {
    // Connect to database
    await connectDB();
    
    console.log('Connected to database. Seeding data...');
    
    // Clear existing data
    await User.deleteMany({});
    await Job.deleteMany({});
    
    console.log('Cleared existing data');
    
    // Create users
    const users = [
      {
        name: 'Alice Smith',
        skills: ['JavaScript', 'React', 'Node.js', 'HTML', 'CSS', 'MongoDB']
      },
      {
        name: 'Bob Johnson',
        skills: ['Python', 'Django', 'Flask', 'PostgreSQL', 'RESTful API']
      },
      {
        name: 'Charlie Brown',
        skills: ['Java', 'Spring', 'Hibernate', 'MySQL', 'Docker']
      },
      {
        name: 'Diana Ross',
        skills: ['JavaScript', 'Angular', 'TypeScript', 'Node.js', 'Express']
      },
      {
        name: 'Ethan Hunt',
        skills: ['React', 'Redux', 'JavaScript', 'CSS', 'Sass', 'Webpack']
      }
    ];
    
    const createdUsers = await User.insertMany(users);
    console.log(`Created ${createdUsers.length} users`);
    
    // Create jobs
    const jobs = [
      {
        title: 'Frontend Developer',
        description: 'We are looking for a skilled Frontend Developer who is proficient with React.js. The ideal candidate should have experience building responsive web applications with modern JavaScript frameworks.',
        requiredSkills: ['React', 'JavaScript', 'HTML', 'CSS', 'Redux'],
        location: 'Remote',
        company: 'TechCorp'
      },
      {
        title: 'Backend Developer',
        description: 'Looking for a backend developer with strong Node.js skills. Experience with Express, MongoDB, and RESTful API design is required.',
        requiredSkills: ['Node.js', 'Express', 'MongoDB', 'RESTful API'],
        location: 'San Francisco',
        company: 'WebSoft'
      },
      {
        title: 'Full Stack Developer',
        description: 'Join our team as a Full Stack Developer proficient in both React and Node.js. You will be responsible for developing and maintaining web applications from front to back.',
        requiredSkills: ['React', 'Node.js', 'JavaScript', 'MongoDB', 'Express'],
        location: 'New York',
        company: 'DevShop'
      },
      {
        title: 'Python Developer',
        description: 'We need a Python developer with Django experience to work on our web applications. Knowledge of PostgreSQL and RESTful APIs is a plus.',
        requiredSkills: ['Python', 'Django', 'PostgreSQL', 'RESTful API'],
        location: 'Chicago',
        company: 'DataSys'
      },
      {
        title: 'Java Backend Developer',
        description: 'Experienced Java developer needed for our enterprise application. Must have experience with Spring, Hibernate, and MySQL.',
        requiredSkills: ['Java', 'Spring', 'Hibernate', 'MySQL'],
        location: 'Boston',
        company: 'EnterpriseApps'
      },
      {
        title: 'Angular Developer',
        description: 'Looking for an Angular developer to join our frontend team. Strong TypeScript skills are required.',
        requiredSkills: ['Angular', 'TypeScript', 'JavaScript', 'HTML', 'CSS'],
        location: 'Seattle',
        company: 'WebFront'
      },
      {
        title: 'DevOps Engineer',
        description: 'We are seeking a DevOps engineer to help us automate our deployment pipeline. Experience with Docker, Kubernetes, and AWS is required.',
        requiredSkills: ['Docker', 'Kubernetes', 'AWS', 'CI/CD', 'Linux'],
        location: 'Remote',
        company: 'CloudOps'
      },
      {
        title: 'Mobile Developer',
        description: 'Join us as a mobile developer to work on our cross-platform application. Experience with React Native is required.',
        requiredSkills: ['React Native', 'JavaScript', 'Mobile Development', 'Redux'],
        location: 'Austin',
        company: 'MobileApps'
      },
      {
        title: 'UI/UX Designer',
        description: 'We need a UI/UX designer with strong skills in Figma and Adobe Creative Suite. Experience with frontend development is a plus.',
        requiredSkills: ['UI Design', 'UX Design', 'Figma', 'Adobe XD', 'HTML', 'CSS'],
        location: 'Remote',
        company: 'DesignStudio'
      },
      {
        title: 'Data Scientist',
        description: 'Looking for a data scientist with strong Python skills and experience with machine learning libraries. Knowledge of data visualization is required.',
        requiredSkills: ['Python', 'Machine Learning', 'Data Analysis', 'SQL', 'Pandas', 'NumPy'],
        location: 'San Francisco',
        company: 'DataInsights'
      }
    ];
    
    const createdJobs = await Job.insertMany(jobs);
    console.log(`Created ${createdJobs.length} jobs`);
    
    console.log('Database seeded successfully!');
    console.log('\nUser IDs for testing:');
    createdUsers.forEach(user => {
      console.log(`${user.name}: ${user._id}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seed function
seedDatabase();
