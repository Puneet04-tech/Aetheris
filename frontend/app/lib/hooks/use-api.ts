import { useState, useEffect, useCallback, useRef } from 'react';
import { postsAPI, communitiesAPI, opportunitiesAPI, qaAPI } from '../../../lib/api';

/**
 * ISSUE 1: useApi Memoization
 * Wrapped fetchData in useCallback to ensure stable identity.
 */
export function useApi<T>(
  apiCall: () => Promise<T>,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies); 

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
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
  return useApi(() => postsAPI.list(
      limit: params.limit,
      offset: params.offset,
      sort: params.sort,
      ...(params.communityId && { communityId: params.communityId }),
      ...(params.search && { search: params.search })
    ), [paramKey]);
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
  const { data, loading, error, refetch } = useApi(
    () => postsAPI.list({ ...params, page: currentPage }),
    [paramKey, currentPage]
  );

  const nextPage = () => {
    const totalPages = (data as any)?.pagination?.pages;
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
  return useApi(() => communitiesAPI.list(params), [paramKey]);
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
  return useApi(() => opportunitiesAPI.list(params), [paramKey]);
}