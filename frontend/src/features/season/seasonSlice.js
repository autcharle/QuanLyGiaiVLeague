import {createSlice, createAsyncThunk} from '@reduxjs/toolkit'
import seasonService from './seasonService'

const initialState = {
    season: null,
    isError: false,
    isSuccess: false,
    isLoading: false,
    message: ''
}

export const getASeason = createAsyncThunk(
    "season/getASeason",
    async (id, thunkAPI) => {
      try {
        // const token = thunkAPI.getState().auth.user.token;
        return await seasonService.getASeason(id);
      } catch (error) {
        const message =
          (error.response &&
            error.response.data &&
            error.response.data.message) ||
          error.message ||
          error.toString();
        return thunkAPI.rejectWithValue(message);
      }
    }
  );

  export const seasonSlice = createSlice({
    name: "season",
    initialState,
    reducers: {
      reset: (state) => initialState,
    },
    extraReducers: (builder) => {
      builder
        .addCase(getASeason.pending, (state) => {
          state.isLoading = true;
        })
        .addCase(getASeason.fulfilled, (state, action) => {
          state.isLoading = false;
          state.isSuccess = true;
          state.goals.push(action.payload);
        })
        .addCase(getASeason.rejected, (state, action) => {
          state.isLoading = false;
          state.isError = true;
          state.message = action.payload;
        })
    },
  });
  
  export const { reset } = seasonSlice.actions;
  export default seasonSlice.reducer;