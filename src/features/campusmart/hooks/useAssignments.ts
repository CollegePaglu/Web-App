/**
 * useAssignments Hook
 * 
 * State management for assignments list with pagination
 */

import { useState, useCallback } from 'react';
import {
    getMyAssignments,
    Assignment,
    PaginatedAssignmentResponse,
    AssignmentFilters,
} from '@/api/assignmentApi';

interface UseAssignmentsReturn {
    assignments: Assignment[];
    loading: boolean;
    refreshing: boolean;
    error: string | null;
    hasMore: boolean;
    page: number;
    total: number;
    fetchAssignments: () => Promise<void>;
    refreshAssignments: () => Promise<void>;
    loadMore: () => Promise<void>;
}

export const useAssignments = (filters?: AssignmentFilters): UseAssignmentsReturn => {
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [total, setTotal] = useState(0);

    const fetchAssignments = useCallback(async () => {
        if (loading) return;

        setLoading(true);
        setError(null);

        try {
            const result: PaginatedAssignmentResponse = await getMyAssignments({
                page: 1,
                limit: 20
            });

            setAssignments(result.items);
            setPage(result.page);
            setHasMore(result.hasMore);
            setTotal(result.total);
        } catch (err: any) {
            console.error('Failed to fetch assignments:', err);
            setError(err.message || 'Failed to load assignments');
        } finally {
            setLoading(false);
        }
    }, [loading]);

    const refreshAssignments = useCallback(async () => {
        if (refreshing) return;

        setRefreshing(true);
        setError(null);

        try {
            const result: PaginatedAssignmentResponse = await getMyAssignments({
                page: 1,
                limit: 20
            });

            setAssignments(result.items);
            setPage(result.page);
            setHasMore(result.hasMore);
            setTotal(result.total);
        } catch (err: any) {
            console.error('Failed to refresh assignments:', err);
            setError(err.message || 'Failed to refresh assignments');
        } finally {
            setRefreshing(false);
        }
    }, [refreshing]);

    const loadMore = useCallback(async () => {
        if (loading || refreshing || !hasMore) return;

        setLoading(true);

        try {
            const nextPage = page + 1;
            const result: PaginatedAssignmentResponse = await getMyAssignments({
                page: nextPage,
                limit: 20
            });

            setAssignments(prev => [...prev, ...result.items]);
            setPage(result.page);
            setHasMore(result.hasMore);
        } catch (err: any) {
            console.error('Failed to load more assignments:', err);
        } finally {
            setLoading(false);
        }
    }, [loading, refreshing, hasMore, page]);

    return {
        assignments,
        loading,
        refreshing,
        error,
        hasMore,
        page,
        total,
        fetchAssignments,
        refreshAssignments,
        loadMore,
    };
};

export default useAssignments;
