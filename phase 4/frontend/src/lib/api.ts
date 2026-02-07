import { Task, CreateTaskInput, UpdateTaskInput, TaskFilter } from "@/types/task";
import { TaskListResponse, TaskResponse, DeleteResponse, ApiError } from "@/types/api";
import { authClient } from "./auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Custom error class for API errors
export class ApiRequestError extends Error {
  constructor(
    message: string,
    public code: string,
    public status: number
  ) {
    super(message);
    this.name = "ApiRequestError";
  }
}

// Get token directly from Better Auth client
async function getTokenForApi(): Promise<string | null> {
  try {
    const session = await authClient.getSession();
    return session?.data?.session?.token || null;
  } catch {
    return null;
  }
}

// Base fetch wrapper with token attachment and error handling
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getTokenForApi();

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorData: ApiError;
    try {
      errorData = await response.json();
    } catch {
      errorData = {
        error: "An unexpected error occurred",
        code: "UNKNOWN_ERROR",
      };
    }

    // Handle specific status codes
    if (response.status === 401) {
      // Token invalid or expired - will be handled by middleware
      throw new ApiRequestError(
        errorData.error || "Unauthorized",
        errorData.code || "UNAUTHORIZED",
        401
      );
    }

    throw new ApiRequestError(
      errorData.error || "Request failed",
      errorData.code || "REQUEST_FAILED",
      response.status
    );
  }

  return response.json();
}

// Task API Functions

export async function getTasks(
  userId: string,
  filter: TaskFilter = "all"
): Promise<Task[]> {
  const queryParam = filter !== "all" ? `?filter=${filter}` : "";
  const response = await apiFetch<TaskListResponse>(
    `/api/${userId}/tasks${queryParam}`
  );
  return response.data;
}

export async function createTask(
  userId: string,
  data: CreateTaskInput
): Promise<Task> {
  const response = await apiFetch<TaskResponse>(`/api/${userId}/tasks`, {
    method: "POST",
    body: JSON.stringify(data),
  });
  return response.data;
}

export async function getTask(userId: string, taskId: number): Promise<Task> {
  const response = await apiFetch<TaskResponse>(
    `/api/${userId}/tasks/${taskId}`
  );
  return response.data;
}

export async function updateTask(
  userId: string,
  taskId: number,
  data: UpdateTaskInput
): Promise<Task> {
  const response = await apiFetch<TaskResponse>(
    `/api/${userId}/tasks/${taskId}`,
    {
      method: "PUT",
      body: JSON.stringify(data),
    }
  );
  return response.data;
}

export async function deleteTask(
  userId: string,
  taskId: number
): Promise<void> {
  await apiFetch<DeleteResponse>(`/api/${userId}/tasks/${taskId}`, {
    method: "DELETE",
  });
}

export async function toggleComplete(
  userId: string,
  taskId: number
): Promise<Task> {
  const response = await apiFetch<TaskResponse>(
    `/api/${userId}/tasks/${taskId}/complete`,
    {
      method: "PATCH",
    }
  );
  return response.data;
}

// Chat API Types
export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ToolCallResult {
  name: string;
  parameters: Record<string, unknown>;
  result: Record<string, unknown>;
}

export interface ChatResponse {
  conversation_id: number;
  response: string;
  tool_calls?: ToolCallResult[];
}

// Chat API Function
export async function sendChatMessage(
  userId: string,
  message: string,
  conversationId?: number
): Promise<ChatResponse> {
  const body: { message: string; conversation_id?: number } = { message };
  if (conversationId) {
    body.conversation_id = conversationId;
  }

  return apiFetch<ChatResponse>(`/api/${userId}/chat`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}
