import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    music: [],
    hasLoadingDone: false,
    error: null,
}

export const music_slice = createSlice({
    name: 'music_slice',
    initialState,
    reducers: {
        setState: (state, action) => {
            state.music = action.payload.music;
            state.hasLoadingDone = action.payload.hasLoadingDone;
            state.error = action.payload.error;
        },
        setMusic: (state, action) => {
            state.music = action.payload;
        },
        removeMusic: (state, action) => {
            let index = state.music.findIndex((o) => action.payload.id === o.id)
            state.music.splice(index, 1)
            state.music = state.music
        }
    },
});

// Action creators are generated for each case reducer function
export const { setState, setMusic, removeMusic } = music_slice.actions;

export default music_slice.reducer;