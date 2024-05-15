import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit'
import contact_slice from './features/contact_slice'
import user_slice from './features/user_slice'
import video_slice from './features/video_slice'
import music_slice from './features/music_slice'
import message_slice from './features/message_slice'
import important_message_slice from './features/important_message_slice'
import notification_slice from './features/notification_slice'
import photo_slice from './features/photo_slice'
import home_slice from './features/home_slice'
import radio_slice from './features/radio_slice'

const customizedMiddleware = getDefaultMiddleware({
    serializableCheck: false
})

export const store = configureStore({
    reducer: {
        user: user_slice,
        contact: contact_slice,
        videos: video_slice,
        music: music_slice,
        message: message_slice,
        important_message: important_message_slice,
        notification: notification_slice,
        photos: photo_slice,
        home: home_slice,
        radios: radio_slice,
    },
    middleware: customizedMiddleware,
})