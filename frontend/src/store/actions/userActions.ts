import { createAsyncThunk } from '@reduxjs/toolkit';
import { User } from '../../types';

export const login = createAsyncThunk(
  'user/login',
  async (credentials: { email: string; password: string }) => {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    return response.json();
  }
);

export const logout = createAsyncThunk(
  'user/logout',
  async () => {
    const response = await fetch('/api/logout', {
      method: 'POST',
    });
    return response.json();
  }
);

export const fetchCurrentUser = createAsyncThunk(
  'user/fetchCurrentUser',
  async () => {
    const response = await fetch('/api/user/current');
    return response.json();
  }
);

export const updateUser = createAsyncThunk(
  'user/updateUser',
  async (userData: Partial<User>) => {
    const response = await fetch('/api/user', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    return response.json();
  }
);