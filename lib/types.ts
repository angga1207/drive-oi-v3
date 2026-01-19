// Types untuk User
export interface UserName {
  fullname: string;
  firstname: string;
  lastname: string;
}

export interface UserStorage {
  total: string;
  used: string;
  rest: string;
  percent: number;
}

export interface User {
  id: number;
  name: UserName;
  username: string;
  email: string;
  googleIntegated: boolean;
  google_id: string | null;
  semestaIntegrated: boolean;
  appleIntegrated: boolean;
  photo: string;
  storage: UserStorage;
  created_at: string;
  updated_at: string;
  access: boolean;
}

// Types untuk Authentication
export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface AuthResponse {
  status: string;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

// Types untuk API Response
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

// Types untuk File/Folder
export interface DriveItem {
  id: number;
  name: string;
  type: 'file' | 'folder';
  size?: number;
  mime_type?: string;
  parent_id: number | null;
  path: string;
  created_at: string;
  updated_at: string;
  is_shared?: boolean;
  owner?: User;
}

// Types untuk Pagination
export interface PaginationMeta {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

// Types untuk Profile
export interface ProfileData {
  id: number;
  fullname: string;
  firstname: string;
  lastname: string;
  username: string;
  email: string;
  googleIntegated: boolean;
  semestaIntegrated: boolean;
  appleIntegrated: boolean;
  photo: string;
  storage: {
    total: string;
    used: string;
    rest: string;
    percent: number;
    total_raw: number;
  };
  datas: {
    files: number;
    folders: number;
    shared: number;
  };
  access: boolean;
  created_at: string | null;
  updated_at: string;
}

// Types untuk Activity Log
export interface Activity {
  id: number;
  description: string;
  ip_address: string;
  agent: string;
  event: string;
  created_at: string;
}

export interface ActivitiesResponse {
  status: string;
  message: string;
  data: {
    data: Activity[];
    current_page: number;
    last_page: number;
    total: number;
  };
}

// Types untuk Admin Users Management
export interface AdminUser {
  id: number;
  fullname: string;
  firstname: string;
  lastname: string;
  username: string;
  email: string;
  googleIntegated: boolean;
  semestaIntegrated: boolean;
  appleIntegrated: boolean;
  photo: string;
  storage: {
    total: string;
    used: string;
    rest: string;
    percent: number;
    total_raw: number;
  };
  datas: {
    files: number;
    folders: number;
    shared: number;
  };
  access: boolean;
  created_at: string | null;
  updated_at: string;
}

export interface UsersListResponse {
  status: string;
  message: string;
  data: {
    data: AdminUser[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    accessed_users_count: number;
    unaccessed_users_count: number;
    google_users_count: number;
    semesta_users_count: number;
    google_and_semesta_users_count: number;
    no_integrated_users_count: number;
  };
}

export interface CreateUserData {
  firstname: string;
  lastname: string;
  email: string;
  username: string;
  capacity: number;
  password: string;
  password_confirmation: string;
}

export interface UpdateUserData {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  capacity: number;
}
