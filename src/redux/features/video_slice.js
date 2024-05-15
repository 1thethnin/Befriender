import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    video: {},
    videos: [],
    hasLoadingDone: false,
    error: null,
}

export const video_slice = createSlice({
    name: 'video_slice',
    initialState,
    reducers: {
        setState: (state, action) => {
            state.videos = action.payload.videos;
            state.hasLoadingDone = action.payload.hasLoadingDone;
            state.error = action.payload.error;
        },
        setVideo: (state, action) => {
            state.videos = action.payload;
        },
        removeVideo: (state, action) => {
            let index = state.videos.findIndex((o) => action.payload.id === o.id)
            state.videos.splice(index, 1)
            state.videos = state.videos
        }
    },
});

// Action creators are generated for each case reducer function
export const { setVideo, setState, removeVideo } = video_slice.actions;

export default video_slice.reducer;