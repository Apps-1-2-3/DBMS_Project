const API_BASE_URL = 'http://localhost:8000/api';

interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface User {
  id: number;
  email: string;
  name: string;
  role: 'ADMIN' | 'MESS_STAFF' | 'STUDENT';
  room_number?: string;
  employee_ssn?: string;
  student_id?: string;
}

export interface Attendance {
  id: number;
  location: string;
  time_stamp: string;
  type: 'IN' | 'OUT';
  studentid: string;
  employeessn?: string;
}

export interface Student {
  studentid: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  hostel_no: number;
  room_no: string;
}

export interface MealChoice {
  optid: number;
  date: string;
  meal_time: 'BREAKFAST' | 'LUNCH' | 'DINNER';
  opted_out: boolean;
  studentid: string;
}

export interface MealMenu {
  poolid: number;
  category: string;
  day: string;
  meal_time: string;
  menu_item: string;
}

export interface Employee {
  ssn: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  role: string;
}

export interface Room {
  room_no: string;
  capacity: number;
  floor: number;
  hostel_no: number;
}

export interface Hostel {
  hostel_no: number;
  hostel_name: string;
  total_floors: number;
  total_rooms: number;
  type: 'BOYS' | 'GIRLS';
}

export interface AnalyticsData {
  attendance: { present: number; absent: number };
  mealOptout: { breakfast: number; lunch: number; dinner: number };
  hostelOccupancy: { boys: number; girls: number };
}

// Token management
let authToken: string | null = localStorage.getItem('auth_token');

const getHeaders = (): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }
  return headers;
};

const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    if (response.status === 401) {
      authToken = null;
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    const error = await response.json().catch(() => ({ detail: 'An error occurred' }));
    throw new Error(error.detail || 'Request failed');
  }
  return response.json();
};

// Auth endpoints
export const api = {
  auth: {
    login: async (email: string, password: string): Promise<AuthResponse> => {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await handleResponse<AuthResponse>(response);
      authToken = data.access_token;
      localStorage.setItem('auth_token', data.access_token);
      return data;
    },
    me: async (): Promise<User> => {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: getHeaders(),
      });
      return handleResponse<User>(response);
    },
    logout: () => {
      authToken = null;
      localStorage.removeItem('auth_token');
    },
  },

  // Students endpoints
  students: {
    getAll: async (): Promise<Student[]> => {
      const response = await fetch(`${API_BASE_URL}/students`, {
        headers: getHeaders(),
      });
      return handleResponse<Student[]>(response);
    },
    getById: async (id: string): Promise<Student> => {
      const response = await fetch(`${API_BASE_URL}/students/${id}`, {
        headers: getHeaders(),
      });
      return handleResponse<Student>(response);
    },
  },

  // Attendance endpoints
  attendance: {
    getAll: async (): Promise<Attendance[]> => {
      const response = await fetch(`${API_BASE_URL}/attendance`, {
        headers: getHeaders(),
      });
      return handleResponse<Attendance[]>(response);
    },
    mark: async (data: { location: string; type: 'IN' | 'OUT'; studentid: string; employeessn?: string }): Promise<Attendance> => {
      const response = await fetch(`${API_BASE_URL}/attendance`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse<Attendance>(response);
    },
  },

  // Meal endpoints
  meals: {
    getMenu: async (day?: string): Promise<MealMenu[]> => {
      const url = day ? `${API_BASE_URL}/mealmenu?day=${day}` : `${API_BASE_URL}/mealmenu`;
      const response = await fetch(url, {
        headers: getHeaders(),
      });
      return handleResponse<MealMenu[]>(response);
    },
    getChoices: async (studentid?: string): Promise<MealChoice[]> => {
      const url = studentid ? `${API_BASE_URL}/choice?studentid=${studentid}` : `${API_BASE_URL}/choice`;
      const response = await fetch(url, {
        headers: getHeaders(),
      });
      return handleResponse<MealChoice[]>(response);
    },
    optOut: async (data: { date: string; meal_time: 'BREAKFAST' | 'LUNCH' | 'DINNER'; opted_out: boolean; studentid: string }): Promise<MealChoice> => {
      const response = await fetch(`${API_BASE_URL}/choice`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse<MealChoice>(response);
    },
  },

  // Admin endpoints
  admin: {
    getEmployees: async (): Promise<Employee[]> => {
      const response = await fetch(`${API_BASE_URL}/employees`, {
        headers: getHeaders(),
      });
      return handleResponse<Employee[]>(response);
    },
    getRooms: async (): Promise<Room[]> => {
      const response = await fetch(`${API_BASE_URL}/rooms`, {
        headers: getHeaders(),
      });
      return handleResponse<Room[]>(response);
    },
    getHostels: async (): Promise<Hostel[]> => {
      const response = await fetch(`${API_BASE_URL}/hostels`, {
        headers: getHeaders(),
      });
      return handleResponse<Hostel[]>(response);
    },
    getAnalytics: async (): Promise<AnalyticsData> => {
      const response = await fetch(`${API_BASE_URL}/analytics`, {
        headers: getHeaders(),
      });
      return handleResponse<AnalyticsData>(response);
    },
  },
};

export default api;
