import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { sessionApi, accountApi, type SessionUser } from "../api";
import { createSessionBootstrap } from "../auth/auth-session.helpers";

type AuthStatus = "idle" | "loading" | "authenticated" | "unauthenticated";

interface AuthState {
  status: AuthStatus;
  user: SessionUser | null;
  error: string | null;
}

const initialState: AuthState = {
  status: "idle",
  user: null,
  error: null
};

export const bootstrapAuth = createAsyncThunk("auth/bootstrap", async () => {
  const run = createSessionBootstrap({
    loadSession: async () => {
      const result = await sessionApi.me();
      return result.user;
    },
    refreshSession: () => sessionApi.refresh()
  });
  return run();
});

export const loginUser = createAsyncThunk(
  "auth/login",
  async ({ email, password }: { email: string; password: string }) => {
    await sessionApi.login(email, password);
    const result = await sessionApi.me();
    return result.user;
  }
);

export const socialSignIn = createAsyncThunk(
  "auth/socialSignIn",
  async ({ email }: { email: string }) => {
    await sessionApi.socialSignIn(email);
    const result = await sessionApi.me();
    return result.user;
  }
);

export const logoutUser = createAsyncThunk("auth/logout", async () => {
  await sessionApi.logout();
});

export const refreshSession = createAsyncThunk("auth/refresh", async () => {
  await sessionApi.refresh();
  const result = await sessionApi.me();
  return result.user;
});

export const reloadUser = createAsyncThunk("auth/reloadUser", async () => {
  const result = await sessionApi.me();
  return result.user;
});

export const registerUser = createAsyncThunk(
  "auth/register",
  async ({ email, password, displayName }: { email: string; password: string; displayName: string }) => {
    const result = await accountApi.register(email, password, displayName);
    return {
      message: result.message,
      previewUrl: result.preview?.previewUrl,
      token: result.preview?.token
    };
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Bootstrap
      .addCase(bootstrapAuth.pending, (state) => {
        state.status = "loading";
      })
      .addCase(bootstrapAuth.fulfilled, (state, action) => {
        state.status = action.payload ? "authenticated" : "unauthenticated";
        state.user = action.payload;
        state.error = null;
      })
      .addCase(bootstrapAuth.rejected, (state) => {
        state.status = "unauthenticated";
        state.user = null;
      })

      // Login
      .addCase(loginUser.pending, (state) => {
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = "authenticated";
        state.user = action.payload;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.error = action.error.message ?? "Login failed.";
      })

      // Social sign-in
      .addCase(socialSignIn.fulfilled, (state, action) => {
        state.status = "authenticated";
        state.user = action.payload;
        state.error = null;
      })
      .addCase(socialSignIn.rejected, (state, action) => {
        state.error = action.error.message ?? "Social sign-in failed.";
      })

      // Logout — state reset is handled by the root reducer
      .addCase(logoutUser.fulfilled, () => initialState)

      // Refresh
      .addCase(refreshSession.fulfilled, (state, action) => {
        state.user = action.payload;
        state.error = null;
      })

      // Reload user
      .addCase(reloadUser.fulfilled, (state, action) => {
        state.user = action.payload;
      });
  }
});

export const authReducer = authSlice.reducer;
