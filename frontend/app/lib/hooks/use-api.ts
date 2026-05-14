import { useState, useEffect, useCallback } from 'react';
import { postsAPI, communitiesAPI, opportunitiesAPI } from '../../../lib/api';

/**
 * ISSUE 1: useApi Memoization
 * Wrapped fetchData in useCallback to ensure stable identity.
 */
export function useApi<T>(
  apiCall: () => Promise<T>,
  dependencies: Array<string | number | boolean> = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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
    
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  const refetch = useCallback(async () => {
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
  }, [apiCall]);

  return { data, loading, error, refetch };
}

/**
 * ISSUE 2: Object Reference Stability
 * Use JSON.stringify for dependencies to prevent infinite loops from object literals.
 */
export function usePosts(params: {
  page?: number;
  limit?: number;
  sortBy?: 'trending' | 'latest' | 'top';
  type?: string;
  community?: string;
  search?: string;
}) {
  const paramKey = JSON.stringify(params);
  const limit = params.limit || 20;
  const offset = ((params.page || 1) - 1) * limit;
  const sortBy = params.sortBy || 'latest';
  return useApi(
    () => postsAPI.list(limit, offset, params.community, sortBy),
    [paramKey]
  );
}

/**
 * ISSUE 3: Pagination Desync
 * Removed redundant fetch calls. Let the dependency array handle the lifecycle.
 */
export function usePaginatedPosts(params: {
  page?: number;
  limit?: number;
  sortBy?: 'trending' | 'latest' | 'top';
  type?: string;
  community?: string;
  search?: string;
}) {
  const [currentPage, setCurrentPage] = useState(params.page || 1);
  const paramKey = JSON.stringify(params);

  // Single source of truth: useApi only fires when params or page changes
  const limit = params.limit || 20;
  const offset = (currentPage - 1) * limit;
  const sortBy = params.sortBy || 'latest';
  const { data, loading, error, refetch } = useApi(
    () => postsAPI.list(limit, offset, params.community, sortBy),
    [paramKey, currentPage]
  );

  const nextPage = () => {
    const totalPages = (data as { pagination?: { pages?: number } })?.pagination?.pages;
    if (totalPages && currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  return {
    data,
    loading,
    error,
    currentPage,
    nextPage,
    prevPage,
    goToPage,
    refetch,
  };
}

export function useCommunities(params: {
  page?: number;
  limit?: number;
  search?: string;
  filter?: 'all' | 'joined' | 'trending';
}) {
  const paramKey = JSON.stringify(params);
  const limit = params.limit || 20;
  const offset = ((params.page || 1) - 1) * limit;
  return useApi(
    () => communitiesAPI.list(limit, offset, params.search),
    [paramKey]
  );
}

/**
 * ISSUE 4: API Endpoint Mapping
 * Corrected from communitiesAPI to opportunitiesAPI.
 */
export function useOpportunities(params: {
  page?: number;
  limit?: number;
  type?: string;
  remote?: string;
  search?: string;
  salaryMin?: number;
  salaryMax?: number;
}) {
  const paramKey = JSON.stringify(params);
  const limit = params.limit || 20;
  const offset = ((params.page || 1) - 1) * limit;
  const remote = params.remote === 'true' ? true : params.remote === 'false' ? false : undefined;
  return useApi(
    () => opportunitiesAPI.list(limit, offset, params.type, remote),
    [paramKey]
  );
}