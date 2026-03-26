import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { login, logout, fetchCurrentUser, updateUser } from '../actions/userActions';
import { UserState, User } from '../../types';

const initialState: UserState = {
  currentUser: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,
  permissions: [],
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    logout: (state) => {
      state.currentUser = null;
      state.isAuthenticated = false;
      state.permissions = [];
    },
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.currentUser = action.payload;
      state.isAuthenticated = true;
      state.permissions = action.payload.permissions;
    },
    clearUser: (state) => {
      state.currentUser = null;
      state.isAuthenticated = false;
      state.permissions = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentUser = action.payload.user;
        state.isAuthenticated = true;
        state.permissions = action.payload.user.permissions;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Login failed';
      })
      .addCase(fetchCurrentUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentUser = action.payload;
        state.isAuthenticated = true;
        state.permissions = action.payload.permissions;
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch user';
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.currentUser = { ...state.currentUser, ...action.payload };
      })
      .addCase(logout.fulfilled, (state) => {
        state.currentUser = null;
        state.isAuthenticated = false;
        state.permissions = [];
      });
  },
});

export const { logout: logoutAction, clearError, setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
