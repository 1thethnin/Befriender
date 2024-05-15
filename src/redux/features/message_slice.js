import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { getMessages } from '../services/message_api'

const initialState = {
    message: {},
    messages: [],
    isLoading: false,
    refresing: false,
    error: null,
}

export const getMessagesThunk = createAsyncThunk(
    'messages',
    async ({ userID, startingObject }, thunkAPI) => {
        const response = await getMessages(userID, startingObject)
        return response
    }
)

export const message_slice = createSlice({
    name: 'message',
    initialState,
    reducers: {
        setMessage: (state, action) => {
            state.message = action.payload;
        },
        addSnapshotMessage: (state, { payload }) => {
            state.messages = payload.concat(state.messages)
        },
        addNewMessage: (state, { payload }) => {
            state.messages.unshift(payload);
        },
        removeMessage: (state, { payload }) => {
            state.messages = state.messages.filter((m) => payload.id != m.id);
        },
        resetMessages: (state, action) => {
            state.messages = []
        }
    },
    extraReducers: {
        [getMessagesThunk.pending]: (state) => {
            if (state.messages.length > 0) {
                state.refresing = true
            } else {
                state.isLoading = true
            }
            console.log('pending');
        },
        [getMessagesThunk.fulfilled]: (state, { payload }) => {
            state.isLoading = false
            state.refresing = false
            state.messages = state.messages.concat(payload)
            console.log('success');
        },
        [getMessagesThunk.rejected]: (state) => {
            console.log('done');
            state.isLoading = false
            state.refresing = false
            state.error = 'Sorry, there was some error fetching data.'
        }
    }
});

// Action creators are generated for each case reducer function
export const { setMessage, addNewMessage, removeMessage, resetMessages, addSnapshotMessage } = message_slice.actions;

export default message_slice.reducer;