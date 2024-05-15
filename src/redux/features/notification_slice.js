import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { getNotifications } from '../services/notification_api'

const initialState = {
    isThereNewNotification: false,
    isLoading: true,
    refreshing: false,
    notifications: [],
}

export const getNotificationsThunk = createAsyncThunk(
    'notification',
    async ({ userID, startingObject }, thunkAPI) => {
        const response = await getNotifications({ userID, startingObject })
        return response
    }
)

export const notification_slice = createSlice({
    name: 'notification_slice',
    initialState,
    reducers: {
        setIsThereNewNotification: (state, action) => {
            state.isThereNewNotification = action.payload;
        },
        addNewNotifications: (state, { payload }) => {
            state.notifications = payload.concat(state.notifications)
        },
        setState: (state, { payload }) => {
            state.notifications = payload.notifications || state.notifications
            state.isThereNewNotification = payload.isThereNewNotification === true
            state.isLoading = payload.isLoading === true
            state.refreshing = payload.refreshing === true
        },
        clearNotiList: (state, { payload }) => {
            state.isThereNewNotification = false
            state.isLoading = true
            state.refreshing = false
            state.notifications = []
        }
    },
    extraReducers: {
        [getNotificationsThunk.pending]: (state) => {
            if (state.notifications.length > 0) {
                state.refreshing = true
                return
            }
            state.isLoading = true
        },
        [getNotificationsThunk.fulfilled]: (state, { payload }) => {
            state.notifications = [...state.notifications, ...payload]
            state.isLoading = false
            state.refreshing = false
        },
        [getNotificationsThunk.rejected]: (state) => {
            state.isLoading = false
            state.refreshing = false
        }
    }
});

// Action creators are generated for each case reducer function
export const {
    setIsThereNewNotification,
    addNewNotifications,
    setState,
    clearNotiList,
} = notification_slice.actions;

export default notification_slice.reducer;