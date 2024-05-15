import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    contact: {},
    contacts: [],
    hasContactsLoadingDone: false,
    contactsLoadingError: null,
    showRelationshipPicker: false,
    selectedNOKContact: null,
}

export const contact_profile_slice = createSlice({
    name: 'contact_profile',
    initialState,
    reducers: {
        setContact: (state, action) => {
            state.contact = action.payload;
        },
        setContacts: (state, action) => {
            state.contacts = action.payload;
        },
        setHasContactsLoadingDone: (state, action) => {
            state.hasContactsLoadingDone = action.payload;
        },
        setContactsLoadingError: (state, action) => {
            state.contactsLoadingError = action.payload;
        },
        setState: (state, action) => {
            state.contacts = action.payload.contacts
            state.hasContactsLoadingDone = action.payload.hasContactsLoadingDone
            state.contactsLoadingError = action.payload.contactsLoadingError
        },
        setSelectedNOKContact: (state, action) => {
            state.selectedNOKContact = action.payload
        },
        setShowRelationshipPicker: (state, action) => {
            state.showRelationshipPicker = action.payload
        }
    },
});

// Action creators are generated for each case reducer function
export const {
    setContact,
    setContacts,
    setHasContactsLoadingDone,
    setContactsLoadingError,
    setState,
    setSelectedNOKContact,
    setShowRelationshipPicker,
} = contact_profile_slice.actions;

export default contact_profile_slice.reducer;