const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
const API_ORIGIN = API_URL.replace(/\/api\/?$/, '');

export const getApiUrl = () => API_URL;
export const getApiOrigin = () => API_ORIGIN;

// Base fetch function with auth
export const fetchWithAuth = async (endpoint, options = {}) => {
    // Get token from localStorage
    const token = localStorage.getItem('token');

    // Default headers
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    // Remove Content-Type if body is FormData (browser needs to set it with boundary)
    if (options.body instanceof FormData) {
        delete headers['Content-Type'];
    }

    // Add Authorization header if token exists
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        ...options,
        headers,
    };

    try {
        const response = await fetch(`${API_URL}${endpoint}`, config);

        // Handle 401 Unauthorized
        if (response.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
            throw new Error('Session expired. Please login again.');
        }

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Something went wrong');
        }

        return data;
    } catch (error) {
        throw error;
    }
};

// Project API
export const getProjects = async () => {
    return await fetchWithAuth('/projects');
};

export const getProject = async (id) => {
    return await fetchWithAuth(`/projects/${id}`);
};

export const createProject = async (projectData) => {
    return await fetchWithAuth('/projects', {
        method: 'POST',
        body: JSON.stringify(projectData),
    });
};

export const updateProject = async (id, projectData) => {
    return await fetchWithAuth(`/projects/${id}`, {
        method: 'PUT',
        body: JSON.stringify(projectData),
    });
};

export const deleteProject = async (id) => {
    return await fetchWithAuth(`/projects/${id}`, {
        method: 'DELETE',
    });
};

// Task API
export const getTasksByProject = async (projectId) => {
    return await fetchWithAuth(`/tasks/project/${projectId}`);
};

export const createTask = async (projectId, taskData) => {
    return await fetchWithAuth(`/tasks/project/${projectId}`, {
        method: 'POST',
        body: JSON.stringify(taskData),
    });
};

export const updateTask = async (id, taskData) => {
    return await fetchWithAuth(`/tasks/${id}`, {
        method: 'PUT',
        body: JSON.stringify(taskData),
    });
};

export const deleteTask = async (id) => {
    return await fetchWithAuth(`/tasks/${id}`, {
        method: 'DELETE',
    });
};

// Profile API
export const getProfile = async () => {
    return await fetchWithAuth('/profile/me');
};

export const updateProfile = async (profileData) => {
    return await fetchWithAuth('/profile/me', {
        method: 'PUT',
        body: JSON.stringify(profileData),
    });
};

export const uploadAvatar = async (formData) => {
    // Note: Content-Type header should be left for the browser to set when using FormData
    // So we need a slight modification to fetchWithAuth or just use raw fetch here for simplicity
    // But fetchWithAuth handles token. Let's see.
    // fetchWithAuth sets Content-Type to application/json by default.
    // We need to override that.

    // Let's modify fetchWithAuth to handle FormData or generic file upload?
    // Or just manually handle it here reusing the token logic.

    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/profile/avatar`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
            // No Content-Type header, browser sets it with boundary
        },
        body: formData
    });

    if (response.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
        throw new Error('Session expired');
    }

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || 'Upload failed');
    }
    return data;
};

export const updateSettings = async (settingsData) => {
    return await fetchWithAuth('/profile/settings', {
        method: 'PUT',
        body: JSON.stringify(settingsData),
    });
};

export const changePassword = async (passwordData) => {
    return await fetchWithAuth('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify(passwordData),
    });
};

export const deleteAccount = async () => {
    return await fetchWithAuth('/profile/account', {
        method: 'DELETE',
    });
};

// Team Management API
export const getProjectMembers = async (projectId) => {
    return await fetchWithAuth(`/projects/${projectId}/members`);
};

export const inviteMember = async (projectId, inviteData) => {
    return await fetchWithAuth(`/projects/${projectId}/invite`, {
        method: 'POST',
        body: JSON.stringify(inviteData),
    });
};

export const verifyInviteToken = async (token) => {
    // Backend route: GET /api/invite/verify/:token
    return await fetchWithAuth(`/invite/verify/${token}`);
};

export const joinProject = async (projectId, token) => {
    return await fetchWithAuth(`/projects/${projectId}/join`, {
        method: 'POST',
        body: JSON.stringify({ token }),
    });
};

export const updateMemberRole = async (projectId, userId, role) => {
    return await fetchWithAuth(`/projects/${projectId}/member/${userId}/role`, {
        method: 'PUT',
        body: JSON.stringify({ role }),
    });
};

export const removeMember = async (projectId, userId) => {
    return await fetchWithAuth(`/projects/${projectId}/member/${userId}`, {
        method: 'DELETE',
    });
};

// Notifications
export const getNotifications = () => fetchWithAuth('/notifications');
export const markNotificationAsRead = (id) => fetchWithAuth(`/notifications/${id}/read`, {
    method: 'PUT'
});
export const markAllNotificationsAsRead = () => fetchWithAuth('/notifications/read-all', {
    method: 'PUT'
});

// Activities
export const getProjectActivities = (projectId, page = 1) => fetchWithAuth(`/activities/project/${projectId}?page=${page}`);
export const getUserActivities = () => fetchWithAuth('/activities/user/me');
export const getTaskActivities = (taskId) => fetchWithAuth(`/activities/task/${taskId}`);

// Comments
export const getTaskComments = (taskId) => fetchWithAuth(`/comments/task/${taskId}`);
export const createComment = (taskId, data) => fetchWithAuth(`/comments/task/${taskId}`, {
    method: 'POST',
    body: data instanceof FormData ? data : JSON.stringify(data)
});
export const updateComment = (commentId, data) => fetchWithAuth(`/comments/${commentId}`, {
    method: 'PUT',
    body: data instanceof FormData ? data : JSON.stringify(data)
});
export const deleteComment = (commentId) => fetchWithAuth(`/comments/${commentId}`, {
    method: 'DELETE'
});
export const getAllComments = () => fetchWithAuth('/comments/all');

// Checklist
export const addChecklistItem = (taskId, data) => fetchWithAuth(`/tasks/${taskId}/checklist`, {
    method: 'POST',
    body: JSON.stringify(data)
});
export const updateChecklistItem = (taskId, itemId, data) => fetchWithAuth(`/tasks/${taskId}/checklist/${itemId}`, {
    method: 'PUT',
    body: JSON.stringify(data)
});
export const deleteChecklistItem = (taskId, itemId) => fetchWithAuth(`/tasks/${taskId}/checklist/${itemId}`, {
    method: 'DELETE'
});
export const reorderChecklist = (taskId, checklist) => fetchWithAuth(`/tasks/${taskId}/checklist/reorder`, {
    method: 'PUT',
    body: JSON.stringify({ checklist })
});
export const bulkChecklistAction = (taskId, action) => fetchWithAuth(`/tasks/${taskId}/checklist/bulk`, {
    method: 'POST',
    body: JSON.stringify({ action })
});

// Analytics
export const getProjectStats = (projectId) => fetchWithAuth(`/analytics/projects/${projectId}/stats`);
export const getBurndownData = (projectId) => fetchWithAuth(`/analytics/projects/${projectId}/burndown`);
export const getDueDateAnalytics = (projectId) => fetchWithAuth(`/analytics/projects/${projectId}/deadlines`);
export const getUserStats = (userId) => fetchWithAuth(`/analytics/users/${userId}/stats`);
export const getTeamProductivity = (projectId) => fetchWithAuth(`/analytics/team/${projectId}/productivity`);
export const getGlobalOverview = () => fetchWithAuth('/analytics/overview');

// Profile & Settings
export const updateDashboardLayout = (layout) => fetchWithAuth('/profile/dashboard-layout', {
    method: 'PUT',
    body: JSON.stringify({ layout })
});
