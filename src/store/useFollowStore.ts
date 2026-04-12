import { create } from 'zustand';

interface FollowState {
    // Map of userId to follow status (true if following, false if not)
    // Undefined means the follow status is not yet known globally
    followedRecord: Record<string, boolean>;

    // Actions
    /** Normalizes id to string so search / feed / profile keys always match */
    setFollowStatus: (userId: string, isFollowing: boolean) => void;
    // Helper to sync multiple user status at once (e.g. on initial feed load)
    syncFollowStatuses: (statuses: Record<string, boolean>) => void;
}

export const useFollowStore = create<FollowState>((set) => ({
    followedRecord: {},

    setFollowStatus: (userId: string, isFollowing: boolean) => {
        const id = String(userId);
        set((state) => ({
            followedRecord: {
                ...state.followedRecord,
                [id]: isFollowing,
            },
        }));
    },

    syncFollowStatuses: (statuses: Record<string, boolean>) =>
        set((state) => {
            const next = { ...state.followedRecord };
            for (const [k, v] of Object.entries(statuses)) {
                next[String(k)] = v;
            }
            return { followedRecord: next };
        }),
}));
