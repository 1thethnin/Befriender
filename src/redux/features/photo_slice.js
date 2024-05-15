import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    photos: [],
    hasLoadingDone: false,
    error: null,
}

export const photo_slice = createSlice({
    name: 'photo_slice',
    initialState,
    reducers: {
        setState: (state, action) => {
            state.photos = action.payload.photos;
            state.hasLoadingDone = action.payload.hasLoadingDone;
            state.error = action.payload.error;
        },
        setPhoto: (state, action) => {
            state.photos = action.payload;
        },
        removePhoto: (state, action) => {
            let index = state.photos.findIndex((o) => action.payload.id === o.id)
            state.photos.splice(index, 1)
            state.photos = state.photos
        }
    },
});

// Action creators are generated for each case reducer function
export const { setState, setPhoto, removePhoto } = photo_slice.actions;

export default photo_slice.reducer;