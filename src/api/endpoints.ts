/**
 * API Endpoints
 * 
 * Centralized endpoint definitions matching the backend routes.
 */

export const API_ENDPOINTS = {
    // Auth endpoints
    AUTH: {
        SEND_OTP: '/auth/otp/send',
        VERIFY_OTP: '/auth/otp/verify',
        REFRESH_TOKEN: '/auth/refresh',
        LOGOUT: '/auth/logout',
    },

    // User endpoints
    USERS: {
        ME: '/users/me',
        UPDATE_PROFILE: '/users/me',
        COMPLETE_PROFILE: '/users/me/complete',
        PROFILE_STATUS: '/users/me/status',
        UPLOAD_AVATAR: '/users/me/avatar',
        UPLOAD_COLLEGE_ID: '/users/me/college-id',
        FOLLOW: (id: string) => `/users/${id}/follow`,
        UNFOLLOW: (id: string) => `/users/${id}/follow`,
        FOLLOWING: (id: string) => `/users/${id}/following`,
        FOLLOWERS: (id: string) => `/users/${id}/followers`,
        /** Public profile for another user */
        PUBLIC_PROFILE: (id: string) => `/users/${id}`,
        SEARCH_USERS: '/users/search',
    },

    // College endpoints
    COLLEGES: {
        LIST: '/colleges',
    },

    // Community endpoints
    COMMUNITY: {
        // Posts
        POSTS: '/community/posts',
        MY_POSTS: '/community/posts/my',
        LIKED_POSTS: '/community/posts/liked',
        POST_BY_ID: (id: string) => `/community/posts/${id}`,
        POST_COMMENTS: (id: string) => `/community/posts/${id}/comments`,
        COMMENT_REPLIES: (postId: string, commentId: string) => `/community/posts/${postId}/comments/${commentId}/replies`,
        POST_VOTE: (id: string) => `/community/posts/${id}/vote`,

        // Media
        MEDIA_UPLOAD: '/community/media/upload',

        // Stories
        STORIES: '/community/stories',
        STORIES_FEED: '/community/stories/feed',
        STORIES_ME: '/community/stories/me',
        STORIES_BY_USER: (userId: string) => `/community/stories/user/${userId}`,
        STORY_BY_ID: (id: string) => `/community/stories/${id}`,
        STORY_VIEW: (id: string) => `/community/stories/${id}/view`,
        STORY_LIKE: (id: string) => `/community/stories/${id}/like`,
        STORY_VIEWERS: (id: string) => `/community/stories/${id}/viewers`,
        STORY_LIKERS: (id: string) => `/community/stories/${id}/likes`,

        // Updates (Official Announcements Feed)
        UPDATES: '/community/updates',
    },

    // Marketplace endpoints
    MARKETPLACE: {
        LISTINGS: '/listings',
        LISTING_BY_ID: (id: string) => `/listings/${id}`,
        MY_LISTINGS: '/listings/my',
    },

    // Orders endpoints  
    ORDERS: {
        LIST: '/orders',
        ORDER_BY_ID: (id: string) => `/orders/${id}`,
        CREATE: '/orders',
        UPDATE_STATUS: (id: string) => `/orders/${id}/status`,
    },

    // Cart endpoints
    CART: {
        GET: '/cart',
        ADD_ITEM: '/cart/items',
        REMOVE_ITEM: (itemId: string) => `/cart/items/${itemId}`,
        CLEAR: '/cart/clear',
    },

    // Assignments endpoints
    ASSIGNMENTS: {
        LIST: '/assignments',
        CREATE: '/assignments',
        ASSIGNMENT_BY_ID: (id: string) => `/assignments/${id}`,
        MY_ASSIGNMENTS: '/assignments/my',
        OPEN_ASSIGNMENTS: '/assignments/open',
        UPDATE_STATUS: (id: string) => `/assignments/${id}/status`,
        RATE: (id: string) => `/assignments/${id}/rate`,
    },

    // Attachments endpoints
    ATTACHMENTS: {
        UPLOAD: '/attachments/upload',
        UPLOAD_SINGLE: '/attachments/upload/single',
    },

    // Alphas endpoints
    ALPHAS: {
        REGISTER: '/alphas/register',
        PROFILE: '/alphas/me',
        AVAILABLE: '/alphas/available',
    },

    // Schedules endpoints
    SCHEDULES: {
        LIST: '/schedules',
        CREATE: '/schedules',
        SCHEDULE_BY_ID: (id: string) => `/schedules/${id}`,
    },

    // Transactions endpoints
    TRANSACTIONS: {
        LIST: '/transactions',
        CREATE_CHECKOUT: '/transactions/checkout',
        VERIFY_PAYMENT: '/transactions/verify',
    },

    // Admin endpoints
    ADMIN: {
        DASHBOARD: '/admin/dashboard',
        ORDERS: '/admin/orders',
        ALPHAS: '/admin/alphas',
        PAYMENTS: '/admin/payments',
    },

    // Society endpoints
    SOCIETY: {
        LOGIN: '/society-auth/login',
        REGISTER: '/society-auth/register',
        PROFILE: (id: string) => `/users/society/${id}`,
        POSTS: (id: string) => `/community/posts/society/${id}`,
    },

    // Config endpoints
    CONFIG: {
        PUBLIC: '/config/public',
    },
} as const;

/**
 * Public endpoints that don't require authentication
 */
export const PUBLIC_ENDPOINTS = [
    API_ENDPOINTS.AUTH.SEND_OTP,
    API_ENDPOINTS.AUTH.VERIFY_OTP,
    API_ENDPOINTS.AUTH.REFRESH_TOKEN,
    API_ENDPOINTS.SOCIETY.LOGIN,
    API_ENDPOINTS.SOCIETY.REGISTER,
    API_ENDPOINTS.COLLEGES.LIST,
    API_ENDPOINTS.CONFIG.PUBLIC,
];

/**
 * Check if an endpoint is public (no auth required)
 */
export const isPublicEndpoint = (url: string): boolean => {
    return PUBLIC_ENDPOINTS.some((endpoint) => url.includes(endpoint));
};

export default API_ENDPOINTS;
