import API from '../axios';

export const authService = {
  login: (credentials) => API.post("/auth/login", credentials).then(res => res.data),
  googleLogin: (idToken) => API.post("/auth/google", { idToken }).then(res => res.data),
  getMyWorkspaces: () => API.get("/workspace/my-workspaces").then(res => res.data),
  register: (userData) => API.post('/auth/register', userData).then(res => res.data),
  verifyOtp: (payload) => API.post("/auth/verify-otp", payload).then(res => res.data),
  resendOtp: (email) => API.post("/auth/resend-otp", { email }).then(res => res.data),
};