import firestore from '@react-native-firebase/firestore'

const ROOT = firestore()
    .collection('important_notifications')

export const getImportantMessages = async (userID, startingObject) => {
    let baseRef = ROOT
        .where('message_creator_id', '==', userID)
        .orderBy('datetime', 'desc')
    if (startingObject) {
        baseRef = baseRef.startAfter(startingObject.datetime.toDate())
    }
    try {
        const query = await baseRef
            .limit(10)
            .get()
        const results = query.docs.map(messageDoc => ({ id: messageDoc.id, ...messageDoc.data() }))
        return results
    } catch (e) {
        console.log(e);
        return []
    }
}

export const deleteImportantMessage = async (id) => {
    console.log('message id=', id);
    try {
        await ROOT
            .doc(id)
            .delete()
        return true
    } catch (e) {
        console.error(e);
        return false
    }
}