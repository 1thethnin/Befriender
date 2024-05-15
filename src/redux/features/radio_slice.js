import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    radios: [],
    hasLoadingDone: false,
    error: null,
}

export const radio_slice = createSlice({
    name: 'radio_slice',
    initialState,
    reducers: {
        setState: (state, action) => {
            state.radios = action.payload.radios;
            state.hasLoadingDone = action.payload.hasLoadingDone;
            state.error = action.payload.error;
        },
        setRadio: (state, action) => {
            state.radios = action.payload;
        },
        removeRadio: (state, action) => {
            let index = state.radios.findIndex((o) => action.payload.id === o.id)
            state.radios.splice(index, 1)
            state.radios = state.radios
        }
    },
});

// Action creators are generated for each case reducer function
export const { setRadio, setState, removeRadio } = radio_slice.actions;

export default radio_slice.reducer;