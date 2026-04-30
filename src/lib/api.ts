const API_BASE_URL = "https://xhtmlreviews.in/punganur/api/community"; // Local backend
const AUTH_BASE_URL = "https://xhtmlreviews.in/punganur/api/auth"; // Auth backend
export const SITE_URL = "https://xhtmlreviews.in/punganur";
const SUPPORT_BASE_URL = "https://xhtmlreviews.in/punganur/api/support";
const SERVICEST_BASE_URL = "https://xhtmlreviews.in/punganur/api/services";
const request = async (
  endpoint: string,
  options: RequestInit = {},
  baseUrl = API_BASE_URL,
) => {
  const url = `${baseUrl}${endpoint}`;

  // Handle query params for GET
  let finalUrl = url;
  if (options.method === "GET" && options.body) {
    const params = new URLSearchParams(options.body as any).toString();
    finalUrl += `?${params}`;
    delete options.body;
  }

  const response = await fetch(finalUrl, {
    ...options,
    headers: {
      Accept: "application/json",
      ...options.headers,
    },
  });

  const content = await response.json();
  if (!response.ok || !content.status) {
    throw new Error(content.message || "API request failed");
  }
  return content;
};

export const authApi = {
  login: (phone: string, otp: string) =>
    request(
      "/login",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp }),
      },
      AUTH_BASE_URL,
    ),
  adminLogin: (login: string) =>
    request(
      "/adminLogin",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login }),
      },
      AUTH_BASE_URL,
    ),
  verifyAdminOtp: (login: string, otp: string) =>
    request(
      "/verifyAdminOtp",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login, otp }),
      },
      AUTH_BASE_URL,
    ),
  getProfile: (userId: string | number, userType: string = "user") => {
    const url = `/getProfile?user_id=${userId}&user_type=${userType}`;
    return request(url, { method: "GET" }, AUTH_BASE_URL);
  },
  updateProfile: (formData: FormData) =>
    request(
      "/updateProfile",
      {
        method: "POST",
        body: formData,
      },
      AUTH_BASE_URL,
    ),
  listUsers: () => request("/listUsers", { method: "GET" }, AUTH_BASE_URL),
};

export const adminApi = {
  // Dashboard
  getDashboardStats: () => request("/adminGetDashboardStats"),

  // Channels
  getChannels: (search?: string) => {
    const url = search
      ? `/adminGetChannels?search=${encodeURIComponent(search)}`
      : `/adminGetChannels`;
    return request(url);
  },
  addChannel: (formData: FormData) =>
    request("/adminAddChannel", {
      method: "POST",
      body: formData,
    }),
  updateChannel: (formData: FormData) =>
    request("/adminUpdateChannel", {
      method: "POST",
      body: formData,
    }),
  deleteChannel: (id: string | number) =>
    request("/adminDeleteChannel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    }),

  // Posts
  getPosts: (params: {
    status?: string;
    search?: string;
    channel_id?: string | number;
  }) => {
    const query = new URLSearchParams(params as any).toString();
    return request(`/adminGetPosts?${query}`);
  },
  getPostById: (id: string | number) =>
    request(`/adminGetPostById?post_id=${id}`),
  addPost: (formData: FormData) =>
    request("/adminAddPost", {
      method: "POST",
      body: formData,
    }),
  updatePost: (formData: FormData) =>
    request("/adminUpdatePost", {
      method: "POST",
      body: formData,
    }),
  approvePost: (id: string | number) =>
    request("/adminApprovePost", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    }),
  togglePin: (id: string | number) =>
    request("/adminTogglePin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    }),
  deletePost: (id: string | number) =>
    request("/adminDeletePost", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    }),
  blockPost: (id: string | number) =>
    request("/adminBlockPost", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    }),
  unblockPost: (id: string | number) =>
    request("/adminUnblockPost", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    }),

  // Reports
  getReports: (params: {
    status?: string;
    search?: string;
    post_id?: string | number;
  }) => {
    const query = new URLSearchParams(params as any).toString();
    return request(`/adminGetReports?${query}`);
  },
  dismissReport: (id: string | number) =>
    request("/adminDismissReport", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    }),
  dismissAllReports: (postId: string | number) =>
    request("/adminDismissAllReports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ post_id: postId }),
    }),

  // Comments / Replies
  getComments: (postId: string | number) =>
    request(`/adminGetComments?post_id=${postId}`),
  addComment: (data: {
    post_id: string | number;
    comment: string;
    admin_id?: number;
  }) =>
    request("/adminAddComment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),
  addReply: (data: {
    parent_comment_id: string | number;
    comment: string;
    admin_id?: number;
  }) =>
    request("/adminAddReply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),
  deleteComment: (id: string | number) =>
    request("/adminDeleteComment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    }),
};

export const servicesApi = {
  // Service Management (Dynamic types)
  getServices: () =>
    request("/getServices", { method: "GET" }, SERVICEST_BASE_URL),
  adminAddService: (data: {
    name: string;
    description?: string;
    icon?: string;
    pricing?: string;
  }) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) formData.append(key, String(value));
    });
    return request(
      "/adminAddService",
      { method: "POST", body: formData },
      SERVICEST_BASE_URL,
    );
  },
  adminUpdateService: (data: {
    id: number | string;
    name?: string;
    description?: string;
    icon?: string;
    is_active?: number;
    pricing?: string;
  }) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) formData.append(key, String(value));
    });
    return request(
      "/adminUpdateService",
      { method: "POST", body: formData },
      SERVICEST_BASE_URL,
    );
  },
  adminDeleteService: (id: number | string) => {
    const formData = new FormData();
    formData.append("id", String(id));
    return request(
      "/adminDeleteService",
      { method: "POST", body: formData },
      SERVICEST_BASE_URL,
    );
  },

  // Minicow Services Requests
  requestService: (data: {
    user_id: number | string;
    service_type: string;
    details?: string;
  }) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) =>
      formData.append(key, String(value)),
    );
    return request(
      "/requestService",
      { method: "POST", body: formData },
      SERVICEST_BASE_URL,
    );
  },
  adminGetServiceRequests: (status?: string) => {
    const url = status
      ? `/adminGetServiceRequests?status=${status}`
      : "/adminGetServiceRequests";
    return request(url, { method: "GET" }, SERVICEST_BASE_URL);
  },
  adminUpdateServiceRequest: (data: {
    id: number | string;
    status: string;
    admin_notes?: string;
  }) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) =>
      formData.append(key, String(value)),
    );
    return request(
      "/adminUpdateServiceRequest",
      { method: "POST", body: formData },
      SERVICEST_BASE_URL,
    );
  },

  // Gallery
  getGallery: () =>
    request("/getGallery", { method: "GET" }, SERVICEST_BASE_URL),
  adminAddGalleryImage: (formData: FormData) =>
    request(
      "/adminAddGalleryImage",
      { method: "POST", body: formData },
      SERVICEST_BASE_URL,
    ),
  adminDeleteGalleryImage: (id: number | string) => {
    const formData = new FormData();
    formData.append("id", String(id));
    return request(
      "/adminDeleteGalleryImage",
      { method: "POST", body: formData },
      SERVICEST_BASE_URL,
    );
  },
};

export const supportApi = {
  listAll: () => request("/listAll", { method: "GET" }, SUPPORT_BASE_URL),
  list: (userId: string | number) =>
    request(`/list/${userId}`, { method: "GET" }, SUPPORT_BASE_URL),
  view: (id: string | number) =>
    request(`/view/${id}`, { method: "GET" }, SUPPORT_BASE_URL),
  create: (data: any) =>
    request(
      "/create",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      },
      SUPPORT_BASE_URL,
    ),
  sendMessage: (data: any) =>
    request(
      "/sendMessage",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      },
      SUPPORT_BASE_URL,
    ),
  uploadFile: (formData: FormData) =>
    request(
      "/uploadFile",
      {
        method: "POST",
        body: formData,
      },
      SUPPORT_BASE_URL,
    ),
  getCategories: () =>
    request("/categories", { method: "GET" }, SUPPORT_BASE_URL),
  updateStatus: (id: string | number, status: string) =>
    request(
      "/updateStatus",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      },
      SUPPORT_BASE_URL,
    ),
  typing: (data: any) =>
    request(
      "/typing",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      },
      SUPPORT_BASE_URL,
    ),
};

export default adminApi;
