const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(url, config);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Posts
  async getPosts(params: {
    page?: number;
    limit?: number;
    sortBy?: 'trending' | 'latest' | 'top';
    type?: string;
    community?: string;
    search?: string;
  }) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString());
      }
    });

    return this.request<PaginatedResponse<any>>(`/api/posts?${searchParams}`);
  }

  async createPost(data: {
    type: string;
    title: string;
    content: string;
    communityId?: string;
    imageUrl?: string;
    codeUrl?: string;
    codeLanguage?: string;
    linkUrl?: string;
    tags?: string[];
  }) {
    return this.request<any>('/api/posts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async votePost(postId: string, voteType: 'upvote' | 'downvote') {
    return this.request<any>(`/api/posts/${postId}/vote`, {
      method: 'POST',
      body: JSON.stringify({ type: voteType }),
    });
  }

  async removeVotePost(postId: string) {
    return this.request<any>(`/api/posts/${postId}/vote`, {
      method: 'DELETE',
    });
  }

  // Communities
  async getCommunities(params: {
    page?: number;
    limit?: number;
    search?: string;
    filter?: 'all' | 'joined' | 'trending';
  }) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString());
      }
    });

    return this.request<PaginatedResponse<any>>(`/api/communities?${searchParams}`);
  }

  async createCommunity(data: {
    name: string;
    description: string;
    icon?: string;
    isPrivate?: boolean;
  }) {
    return this.request<any>('/api/communities', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async joinCommunity(communityId: string) {
    return this.request<any>(`/api/communities/${communityId}/join`, {
      method: 'POST',
    });
  }

  async leaveCommunity(communityId: string) {
    return this.request<any>(`/api/communities/${communityId}/leave`, {
      method: 'DELETE',
    });
  }

  // Opportunities
  async getOpportunities(params: {
    page?: number;
    limit?: number;
    type?: string;
    remote?: string;
    search?: string;
    salaryMin?: number;
    salaryMax?: number;
  }) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString());
      }
    });

    return this.request<PaginatedResponse<any>>(`/api/opportunities?${searchParams}`);
  }

  async createOpportunity(data: {
    title: string;
    description: string;
    company: string;
    location: string;
    type: string;
    salaryMin?: number;
    salaryMax?: number;
    equity?: string;
    remote?: boolean;
    tags?: string[];
  }) {
    return this.request<any>('/api/opportunities', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Health check
  async healthCheck() {
    return this.request<any>('/api/health');
  }
}

export const apiClient = new ApiClient();
