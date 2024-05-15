import { createSlice } from "@reduxjs/toolkit"

const initialState = {
    showCheckbox: false
}

export const home_slice = createSlice({
    name: 'home',
    initialState,
    reducers: {
        setShowCheckbox: (state, action) => {
            state.showCheckbox = action.payload;
        }
    }
})

export const {
    setShowCheckbox,
} = home_slice.actions;

export default home_slice.reducer;