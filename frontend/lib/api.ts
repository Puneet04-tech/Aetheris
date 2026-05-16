// Frontend API Client
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

console.log('API_BASE_URL:', API_BASE_URL);

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  details?: string;
  message?: string;
}

async function apiCall<T>(
  endpoint: string,
  method: string = 'GET',
  body?: any,
  useAuth: boolean = true
): Promise<T> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (useAuth) {
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      headers['Authorization'] = `Bearer ${userData.id}`;
    }
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || errorData.message || `HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API Error [${method} ${endpoint}]:`, error);
    throw error;
  }
}

// Posts API
export const postsAPI = {
  list: async (limit = 20, offset = 0, communityId?: string, sort = 'latest') => {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
      sort,
      ...(communityId && { communityId }),
    });
    return apiCall<any>(`/posts?${params}`, 'GET', null, false);
  },

  create: async (type: string, title: string, content: string, tags: string[] = []) => {
    return apiCall<any>('/posts', 'POST', {
      type,
      title,
      content,
      tags,
    });
  },

  upvote: async (postId: string) => {
    return apiCall<any>(`/posts/${postId}/vote`, 'POST', {
      type: 'upvote',
    });
  },

  downvote: async (postId: string) => {
    return apiCall<any>(`/posts/${postId}/vote`, 'POST', {
      type: 'downvote',
    });
  },

  addComment: async (postId: string, content: string) => {
    return apiCall<any>(`/posts/${postId}/comments`, 'POST', {
      content,
    });
  },

  getComments: async (postId: string) => {
    return apiCall<any>(`/posts/${postId}/comments`, 'GET', null, false);
  },

  sendTypingEvent: async (postId: string, userName: string, isTyping: boolean) => {
    return apiCall<any>(`/posts/${postId}/typing`, 'POST', {
      userName,
      isTyping,
    });
  },
};

// Communities API
export const communitiesAPI = {
  list: async (limit = 20, offset = 0, search?: string) => {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
      ...(search && { search }),
    });
    return apiCall<any>(`/communities?${params}`, 'GET', null, false);
  },

  create: async (data: { name: string; description: string; icon: string; isPrivate: boolean }) => {
    return apiCall<any>('/communities', 'POST', data);
  },

  toggleJoin: async (communityId: string) => {
    return apiCall<any>(`/communities/${communityId}/join`, 'POST', {});
  },

  getMembers: async (communityId: string) => {
    return apiCall<any>(`/communities/${communityId}/members`, 'GET', null, false);
  },
};

// Opportunities API
export const opportunitiesAPI = {
  list: async (limit = 20, offset = 0, type?: string, remote?: boolean) => {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
      ...(type && { type }),
      ...(remote !== undefined && { remote: remote.toString() }),
    });
    return apiCall<any>(`/opportunities?${params}`, 'GET', null, false);
  },

  create: async (data: { 
    title: string; 
    description: string; 
    company: string; 
    location: string; 
    type: string; 
    remote: boolean 
  }) => {
    return apiCall<any>('/opportunities', 'POST', data);
  },

  toggleApply: async (opportunityId: string, message?: string) => {
    return apiCall<any>(`/opportunities/${opportunityId}/apply`, 'POST', {
      message,
    });
  },

  save: async (opportunityId: string) => {
    return apiCall<any>(`/opportunities/${opportunityId}/save`, 'POST', {});
  },
};

// Q&A API
export const qaAPI = {
  listQuestions: async (limit = 20, offset = 0, sort = 'latest') => {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
      sort,
    });
    return apiCall<any>(`/qa?${params}`, 'GET', null, false);
  },

  createQuestion: async (title: string, content: string, category = 'general', tags: string[] = []) => {
    return apiCall<any>('/qa', 'POST', {
      title,
      content,
      category,
      tags,
    });
  },

  postAnswer: async (questionId: string, content: string) => {
    return apiCall<any>(`/qa/${questionId}/answers`, 'POST', {
      content,
    });
  },

  getAnswers: async (questionId: string) => {
    return apiCall<any>(`/qa/${questionId}/answers`, 'GET', null, false);
  },

  voteAnswer: async (answerId: string, type: 'upvote' | 'downvote') => {
    return apiCall<any>(`/qa/answers/${answerId}/vote`, 'POST', {
      type,
    });
  },
};

// Users API
export const usersAPI = {
  getStats: async () => {
    return apiCall<any>('/users/stats', 'GET');
  },
};


export default {
  postsAPI,
  communitiesAPI,
  opportunitiesAPI,
  qaAPI,
};
