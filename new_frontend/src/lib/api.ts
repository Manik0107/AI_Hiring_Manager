export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
export const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL || "ws://localhost:8000";

export const endpoints = {
    auth: {
        signup: `${API_BASE_URL}/auth/signup`,
        login: `${API_BASE_URL}/auth/login`,
        me: `${API_BASE_URL}/auth/me`,
        verifyToken: `${API_BASE_URL}/auth/verify-token`,
    },
    dashboard: {
        stats: `${API_BASE_URL}/dashboard/stats`,
        candidates: `${API_BASE_URL}/dashboard/candidates`,
    },
    apply: `${API_BASE_URL}/candidates/apply`,
    verifyOtp: `${API_BASE_URL}/candidates/verify-otp`,
    status: (email: string) => `${API_BASE_URL}/candidates/status/${email}`,
    completeRound: `${API_BASE_URL}/candidates/complete-round`,
    chat: `${API_BASE_URL}/chat`,
    interviewWs: `${WS_BASE_URL}/interview/ws`,
    quiz: {
        status: `${API_BASE_URL}/quiz/status`,
        submit: `${API_BASE_URL}/quiz/submit`
    },
    admin: {
        grantReattempt: (id: number) => `${API_BASE_URL}/admin/candidate/${id}/grant-reattempt`,
    }
};
