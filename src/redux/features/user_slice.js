import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    user: {},
    contacts: [],
    callingUsers: [],
}

export const user_slice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setUser: (state, action) => {
            state.user = action.payload;
        },
        setContacts: (state, { payload }) => {
            state.contacts = payload
        },
        setCallingUsers: (state, { payload }) => {
            state.callingUsers = payload
        }
    },
});

// Action creators are generated for each case reducer function
export const { setUser, setContacts, setCallingUsers } = user_slice.actions;

export default user_slice.reducer;