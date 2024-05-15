import firestore from '@react-native-firebase/firestore'

const ROOT = firestore()
    .collection('notifications')

export const getMessages = async (userID, startingObject) => {
    let baseRef = ROOT
        .where('message_creator_id', '==', userID)
        .orderBy('datetime', 'desc')
    if (startingObject) {
        baseRef = baseRef.startAfter(startingObject.datetime.toDate())
    }
    const query = await baseRef
        .limit(10)
        .get()
    const results = query.docs.map(messageDoc => ({ id: messageDoc.id, ...messageDoc.data() }))
    console.log('messages count=', results.length);
    return results
}

export const deleteMessage = async (id) => {
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