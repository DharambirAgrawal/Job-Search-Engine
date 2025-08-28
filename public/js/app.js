// API base URL
const API_BASE_URL = '/api';

// DOM Elements
document.addEventListener('DOMContentLoaded', () => {
    // Tab navigation
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    // Forms
    const addUserForm = document.getElementById('add-user-form');
    const addJobForm = document.getElementById('add-job-form');
    const matchForm = document.getElementById('match-form');
    const searchForm = document.getElementById('search-form');
    const skillRecommendForm = document.getElementById('skill-recommend-form');
    const skillPathForm = document.getElementById('skill-path-form');

    // Buttons
    const refreshUsersBtn = document.getElementById('refresh-users');
    const refreshJobsBtn = document.getElementById('refresh-jobs');

    // Lists
    const usersList = document.getElementById('users-list');
    const jobsList = document.getElementById('jobs-list');
    const matchResults = document.getElementById('match-results');
    const searchResults = document.getElementById('search-results');
    const skillResults = document.getElementById('skill-results');

    // Toast
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');

    // Tab Navigation
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons and content
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked button and corresponding content
            button.classList.add('active');
            const tabId = button.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });

    // Initialize - Load initial data
    loadUsers();
    loadJobs();
    populateUserDropdown();

    // Event Listeners
    if (refreshUsersBtn) refreshUsersBtn.addEventListener('click', loadUsers);
    if (refreshJobsBtn) refreshJobsBtn.addEventListener('click', loadJobs);
    
    if (addUserForm) addUserForm.addEventListener('submit', handleAddUser);
    if (addJobForm) addJobForm.addEventListener('submit', handleAddJob);
    if (matchForm) matchForm.addEventListener('submit', handleMatch);
    if (searchForm) searchForm.addEventListener('submit', handleSearch);
    if (skillRecommendForm) skillRecommendForm.addEventListener('submit', handleSkillRecommend);
    if (skillPathForm) skillPathForm.addEventListener('submit', handleSkillPath);

    // API Functions
    async function fetchAPI(endpoint, method = 'GET', data = null) {
        try {
            const options = {
                method,
                headers: {
                    'Content-Type': 'application/json'
                }
            };

            if (data && (method === 'POST' || method === 'PUT')) {
                options.body = JSON.stringify(data);
            }

            const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
            
            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            showToast(error.message, 'error');
            return null;
        }
    }

    // Load Users
    async function loadUsers() {
        usersList.innerHTML = '<p class="loading">Loading users...</p>';
        const users = await fetchAPI('/users');
        
        if (users && users.length > 0) {
            usersList.innerHTML = '';
            users.forEach(user => {
                usersList.innerHTML += createUserListItem(user);
            });
            
            // Add event listeners to delete buttons
            document.querySelectorAll('.delete-user-btn').forEach(btn => {
                btn.addEventListener('click', (e) => deleteUser(e.target.dataset.id));
            });
        } else {
            usersList.innerHTML = '<p class="info-message">No users found. Add a new user to get started.</p>';
        }
        
        // Update user dropdown
        populateUserDropdown();
    }

    // Load Jobs
    async function loadJobs() {
        jobsList.innerHTML = '<p class="loading">Loading jobs...</p>';
        const jobs = await fetchAPI('/jobs');
        
        if (jobs && jobs.length > 0) {
            jobsList.innerHTML = '';
            jobs.forEach(job => {
                jobsList.innerHTML += createJobListItem(job);
            });
            
            // Add event listeners to delete buttons
            document.querySelectorAll('.delete-job-btn').forEach(btn => {
                btn.addEventListener('click', (e) => deleteJob(e.target.dataset.id));
            });
        } else {
            jobsList.innerHTML = '<p class="info-message">No jobs found. Add a new job to get started.</p>';
        }
    }

    // Populate User Dropdown
    async function populateUserDropdown() {
        const matchUserSelect = document.getElementById('match-user');
        if (!matchUserSelect) return;
        
        // Keep selected value if exists
        const selectedValue = matchUserSelect.value;
        
        // Clear all options except the first one
        while (matchUserSelect.options.length > 1) {
            matchUserSelect.remove(1);
        }
        
        const users = await fetchAPI('/users');
        
        if (users && users.length > 0) {
            users.forEach(user => {
                const option = document.createElement('option');
                option.value = user._id;
                option.textContent = user.name;
                matchUserSelect.appendChild(option);
            });
            
            // Restore selected value if it exists in new options
            if (selectedValue) {
                matchUserSelect.value = selectedValue;
            }
        }
    }

    // Handle Adding a User
    async function handleAddUser(e) {
        e.preventDefault();
        
        const nameInput = document.getElementById('user-name');
        const skillsInput = document.getElementById('user-skills');
        
        const name = nameInput.value.trim();
        const skillsString = skillsInput.value.trim();
        
        if (!name) {
            showToast('Name is required', 'error');
            return;
        }
        
        const skills = skillsString ? skillsString.split(',').map(skill => skill.trim()) : [];
        
        const userData = { name, skills };
        
        const result = await fetchAPI('/users', 'POST', userData);
        
        if (result) {
            showToast('User added successfully', 'success');
            nameInput.value = '';
            skillsInput.value = '';
            loadUsers();
        }
    }

    // Handle Adding a Job
    async function handleAddJob(e) {
        e.preventDefault();
        
        const titleInput = document.getElementById('job-title');
        const companyInput = document.getElementById('job-company');
        const locationInput = document.getElementById('job-location');
        const skillsInput = document.getElementById('job-skills');
        const descriptionInput = document.getElementById('job-description');
        
        const title = titleInput.value.trim();
        const company = companyInput.value.trim();
        const location = locationInput.value.trim();
        const skillsString = skillsInput.value.trim();
        const description = descriptionInput.value.trim();
        
        if (!title || !company || !location || !description) {
            showToast('All fields except skills are required', 'error');
            return;
        }
        
        const requiredSkills = skillsString ? skillsString.split(',').map(skill => skill.trim()) : [];
        
        const jobData = { 
            title, 
            company, 
            location, 
            requiredSkills, 
            description
        };
        
        const result = await fetchAPI('/jobs', 'POST', jobData);
        
        if (result) {
            showToast('Job added successfully', 'success');
            titleInput.value = '';
            companyInput.value = '';
            locationInput.value = '';
            skillsInput.value = '';
            descriptionInput.value = '';
            loadJobs();
        }
    }

    // Handle Job Matching
    async function handleMatch(e) {
        e.preventDefault();
        
        const userSelect = document.getElementById('match-user');
        const algorithmSelect = document.getElementById('match-algorithm');
        const limitInput = document.getElementById('match-limit');
        
        const userId = userSelect.value;
        const algorithm = algorithmSelect.value;
        const limit = parseInt(limitInput.value, 10) || 5;
        
        if (!userId) {
            showToast('Please select a user', 'error');
            return;
        }
        
        matchResults.innerHTML = '<p class="loading">Finding matches...</p>';
        
        const result = await fetchAPI(`/matcher/match/${userId}?algorithm=${algorithm}&limit=${limit}`);
        
        if (result && result.length > 0) {
            matchResults.innerHTML = '';
            result.forEach(match => {
                matchResults.innerHTML += createMatchListItem(match);
            });
        } else {
            matchResults.innerHTML = '<p class="info-message">No matching jobs found for this user.</p>';
        }
    }

    // Handle Job Search
    async function handleSearch(e) {
        e.preventDefault();
        
        const queryInput = document.getElementById('search-query');
        const limitInput = document.getElementById('search-limit');
        
        const query = queryInput.value.trim();
        const limit = parseInt(limitInput.value, 10) || 5;
        
        if (!query) {
            showToast('Please enter a search query', 'error');
            return;
        }
        
        searchResults.innerHTML = '<p class="loading">Searching...</p>';
        
        const result = await fetchAPI(`/search?q=${encodeURIComponent(query)}&limit=${limit}`);
        
        if (result && result.length > 0) {
            searchResults.innerHTML = '';
            result.forEach(job => {
                searchResults.innerHTML += createJobListItem(job);
            });
        } else {
            searchResults.innerHTML = '<p class="info-message">No jobs found matching your search.</p>';
        }
    }

    // Handle Skill Recommendations
    async function handleSkillRecommend(e) {
        e.preventDefault();
        
        const skillsInput = document.getElementById('recommend-skills');
        const limitInput = document.getElementById('recommend-limit');
        
        const skillsString = skillsInput.value.trim();
        const limit = parseInt(limitInput.value, 10) || 5;
        
        if (!skillsString) {
            showToast('Please enter at least one skill', 'error');
            return;
        }
        
        const skills = skillsString.split(',').map(skill => skill.trim());
        
        skillResults.innerHTML = '<p class="loading">Getting recommendations...</p>';
        
        const result = await fetchAPI('/skills/recommend', 'POST', { skills, limit });
        
        if (result && result.length > 0) {
            skillResults.innerHTML = '<h4>Recommended Skills:</h4><div class="skills-list">';
            result.forEach(skill => {
                skillResults.innerHTML += `<span class="skill-tag">${skill}</span>`;
            });
            skillResults.innerHTML += '</div>';
        } else {
            skillResults.innerHTML = '<p class="info-message">No skill recommendations found.</p>';
        }
    }

    // Handle Skill Path
    async function handleSkillPath(e) {
        e.preventDefault();
        
        const fromInput = document.getElementById('path-from');
        const toInput = document.getElementById('path-to');
        
        const fromSkill = fromInput.value.trim();
        const toSkill = toInput.value.trim();
        
        if (!fromSkill || !toSkill) {
            showToast('Both skills are required', 'error');
            return;
        }
        
        skillResults.innerHTML = '<p class="loading">Finding skill path...</p>';
        
        const result = await fetchAPI('/skills/path', 'POST', { fromSkill, toSkill });
        
        if (result && result.path && result.path.length > 0) {
            skillResults.innerHTML = '<h4>Skill Path:</h4><div class="list-item">';
            result.path.forEach((skill, index) => {
                if (index > 0) {
                    skillResults.innerHTML += ' → ';
                }
                skillResults.innerHTML += `<strong>${skill}</strong>`;
            });
            skillResults.innerHTML += '</div>';
        } else {
            skillResults.innerHTML = `
                <p class="error-message">No path found between "${fromSkill}" and "${toSkill}".</p>
                <p class="info-message">Try checking the capitalization or try different skills.</p>
            `;
            
            // Load and display some common skills as suggestions
            loadCommonSkills();
        }
    }
    
    // Load common skills as suggestions
    async function loadCommonSkills() {
        const commonSkills = await fetchAPI('/skills/common?limit=8');
        
        if (commonSkills && commonSkills.length > 0) {
            skillResults.innerHTML += `
                <div class="suggestion-box">
                    <h4>Available Skills (Try These):</h4>
                    <div class="skills-list">
                        ${commonSkills.map(skill => `<span class="skill-tag suggestion" data-skill="${skill}">${skill}</span>`).join('')}
                    </div>
                </div>
            `;
            
            // Add click event to suggested skills
            document.querySelectorAll('.skill-tag.suggestion').forEach(tag => {
                tag.addEventListener('click', () => {
                    const skill = tag.dataset.skill;
                    // Ask user which field to fill
                    const field = confirm(`Use "${skill}" as the FROM skill?`) ? 'from' : 'to';
                    
                    if (field === 'from') {
                        document.getElementById('path-from').value = skill;
                    } else {
                        document.getElementById('path-to').value = skill;
                    }
                });
            });
        }
    }

    // Delete User
    async function deleteUser(userId) {
        if (!confirm('Are you sure you want to delete this user?')) {
            return;
        }
        
        const result = await fetchAPI(`/users/${userId}`, 'DELETE');
        
        if (result) {
            showToast('User deleted successfully', 'success');
            loadUsers();
        }
    }

    // Delete Job
    async function deleteJob(jobId) {
        if (!confirm('Are you sure you want to delete this job?')) {
            return;
        }
        
        const result = await fetchAPI(`/jobs/${jobId}`, 'DELETE');
        
        if (result) {
            showToast('Job deleted successfully', 'success');
            loadJobs();
        }
    }

    // Helper Functions
    function createUserListItem(user) {
        return `
            <div class="list-item">
                <h4>${user.name}</h4>
                <div class="skills-list">
                    ${user.skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
                </div>
                <button class="btn btn-small delete-user-btn" data-id="${user._id}">Delete</button>
            </div>
        `;
    }

    function createJobListItem(job) {
        return `
            <div class="list-item">
                <h4>${job.title}</h4>
                <p>${job.company} • ${job.location}</p>
                <p>${job.description.substring(0, 100)}${job.description.length > 100 ? '...' : ''}</p>
                <div class="skills-list">
                    ${job.requiredSkills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
                </div>
                <button class="btn btn-small delete-job-btn" data-id="${job._id}">Delete</button>
            </div>
        `;
    }

    function createMatchListItem(match) {
        return `
            <div class="list-item">
                <h4>${match.job.title}</h4>
                <p>${match.job.company} • ${match.job.location}</p>
                <p>Match Score: <span class="match-score">${Math.round(match.score * 100)}%</span></p>
                <div class="skills-list">
                    ${match.job.requiredSkills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
                </div>
            </div>
        `;
    }

    function showToast(message, type = '') {
        toastMessage.textContent = message;
        toast.className = 'toast';
        
        if (type) {
            toast.classList.add(type);
        }
        
        toast.classList.remove('hidden');
        
        setTimeout(() => {
            toast.classList.add('hidden');
        }, 3000);
    }
});
