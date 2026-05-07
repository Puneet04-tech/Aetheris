import { useState, useEffect } from 'react';
import { apiClient, PaginatedResponse } from '../api';

export function useApi<T>(
  apiCall: () => Promise<T>,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiCall();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, dependencies);

  return { data, loading, error, refetch: fetchData };
}

export function usePosts(params: {
  page?: number;
  limit?: number;
  sortBy?: 'trending' | 'latest' | 'top';
  type?: string;
  community?: string;
  search?: string;
}) {
  return useApi(() => apiClient.getPosts(params), [params]);
}

export function usePaginatedPosts(params: {
  page?: number;
  limit?: number;
  sortBy?: 'trending' | 'latest' | 'top';
  type?: string;
  community?: string;
  search?: string;
}) {
  const [data, setData] = useState<PaginatedResponse<any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(params.page || 1);

  const fetchPosts = async (page: number = currentPage) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiClient.getPosts({ ...params, page });
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [params]);

  const nextPage = () => {
    if (data && currentPage < data.pagination.pages) {
      const newPage = currentPage + 1;
      setCurrentPage(newPage);
      fetchPosts(newPage);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      const newPage = currentPage - 1;
      setCurrentPage(newPage);
      fetchPosts(newPage);
    }
  };

  const goToPage = (page: number) => {
    setCurrentPage(page);
    fetchPosts(page);
  };

  return {
    data,
    loading,
    error,
    currentPage,
    nextPage,
    prevPage,
    goToPage,
    refetch: () => fetchPosts(currentPage),
  };
}

export function useCommunities(params: {
  page?: number;
  limit?: number;
  search?: string;
  filter?: 'all' | 'joined' | 'trending';
}) {
  return useApi(() => apiClient.getCommunities(params), [params]);
}

export function useOpportunities(params: {
  page?: number;
  limit?: number;
  type?: string;
  remote?: string;
  search?: string;
  salaryMin?: number;
  salaryMax?: number;
}) {
  return useApi(() => apiClient.getOpportunities(params), [params]);
}
