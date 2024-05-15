import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { getImportantMessages } from '../services/important_message_api'

const initialState = {
    messages: [],
    isLoading: false,
    error: null,
}

export const getImportantMessagesThunk = createAsyncThunk(
    'important_messages',
    async ({ userID, startingObject }, thunkAPI) => {
        const response = await getImportantMessages(userID, startingObject)
        return response
    }
)

export const important_message_slice = createSlice({
    name: 'important_messages',
    initialState,
    reducers: {
        addSnapshotImportantMessage: (state, { payload }) => {
            state.messages = payload.concat(state.messages)
        },
        addNewImportantMessage: (state, { payload }) => {
            state.messages.unshift(payload)
        },
        removeImportantMessage: (state, { payload }) => {
            state.messages = state.messages.filter(m => payload.id !== m.id)
        },
        resetMessages: (state) => {
            state.messages = []
        },
    },
    extraReducers: {
        [getImportantMessagesThunk.pending]: (state) => {
            state.isLoading = true
            console.log('pending');
        },
        [getImportantMessagesThunk.fulfilled]: (state, { payload }) => {
            state.isLoading = false
            state.messages = payload
            console.log('success');
        },
        [getImportantMessagesThunk.rejected]: (state) => {
            console.log('done');
            state.isLoading = false
            state.error = 'Sorry, there was some error fetching data.'
        },
    }
});

// Action creators are generated for each case reducer function
export const { addSnapshotImportantMessage, addNewImportantMessage, removeImportantMessage, resetMessages } = important_message_slice.actions;

export default important_message_slice.reducer;