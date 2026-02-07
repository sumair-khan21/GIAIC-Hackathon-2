// API response types

import { Task } from "./task";

export interface ApiResponse<T> {
  data: T;
  message: string;
}

export interface ApiError {
  error: string;
  code: string;
}

export type TaskListResponse = ApiResponse<Task[]>;
export type TaskResponse = ApiResponse<Task>;
export type DeleteResponse = ApiResponse<null>;
