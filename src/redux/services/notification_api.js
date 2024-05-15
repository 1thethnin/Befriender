import firestore from '@react-native-firebase/firestore'

const COLLECTION = firestore()
    .collection('send_admin_mails')

export const getNotifications = async ({ userID, startingObject }) => {
    try {
        let ref = COLLECTION
            .where('befrienders', 'array-contains', userID)
            .orderBy('datetime', 'desc')
        if (startingObject && startingObject.datetime) {
            ref = ref.startAfter(startingObject.datetime.toDate());
        }
        const result = await ref
            .limit(10)
            .get()
        if (result) {
            return result.docs.map((o) => ({ id: o.id, ...o.data() }))
        }
        return []
    } catch (e) {
        console.error('getNotificationsByPagination Error,', e)
        return []
    }
}