const { ObjectId } = require('mongodb');
const { getConnectedClient } = require('./config/db');

class DataModel {
    async getDb() {
        try {
            const client = await getConnectedClient();
            const db = await client.db('ichat');
            return db;
        } catch (error) {
            return error;
        }
    }

    async getListUser(id) {
        try {
            const db = await this.getDb();
            const usersCollection = await db.collection('users');

            const users = await usersCollection.find({ _id: { $ne: new ObjectId(id) } }).toArray();
            return users;
        } catch (error) {
            return error;
        }
    }

    async getListChat(id) {
        try {
            const db = await this.getDb();
            const conversationsCollection = await db.collection('conversations');

            const listChat = await conversationsCollection.aggregate([
                {           // join data from messages collection that has an equal id conversation
                    $lookup: {
                        from: 'messages',
                        localField: '_id',
                        foreignField: 'id_conversations',
                        as: 'last_message'
                    }
                },
                {           // join data from users collection by members_id field in conversations collection
                    $lookup: {
                        from: 'users',
                        localField: 'members_id',
                        foreignField: '_id',
                        let: { membersId: '$members_id' },  // variable for storing the members_id field
                        pipeline: [     // query to filter data members from lookup procces that not equal to user logged in id
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $in: ['$_id', '$$membersId'] },
                                            { $ne: ['$_id', new ObjectId(id)] }
                                        ]
                                    }
                                }
                            }
                        ],
                        as: 'members'
                    }
                },
                {
                    $match: {
                        members_id: { $in: [new ObjectId(id)] }
                    }
                },
                { $addFields: { last_message: { $slice: ["$last_message", -1] } } },
                { $project: { "members_id": 0 } }
            ])
                .toArray();

            return listChat;
        } catch (error) {
            return error;
        }
    }

    async getConversation(id_user, id_listchat) {
        try {
            const db = await this.getDb();
            const conversationsCollection = await db.collection('conversations');

            const conversation = await conversationsCollection.aggregate([
                {
                    $match: { _id: new ObjectId(id_listchat) }
                },
                {
                    $lookup: {
                        from: "messages",
                        localField: "_id",
                        foreignField: "id_conversations",
                        as: "conversations"
                    }
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "members_id",
                        foreignField: "_id",
                        let: { membersId: '$members_id' },  // variable for storing the members_id field
                        pipeline: [     // query to filter data members from lookup procces that not equal to user logged in id
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $in: ['$_id', '$$membersId'] },
                                            { $ne: ['$_id', new ObjectId(id_user)] }
                                        ]
                                    }
                                }
                            }
                        ],
                        as: "members"
                    }
                },
                {
                    $project: { "members_id": 0 }
                },
            ]).toArray();

            return conversation[0];
        } catch (error) {
            return error;
        }
    }

    async addMessage(data) {
        try {
            const db = await this.getDb();
            const messagesCollection = await db.collection('messages');
            
            data['sender'] = new ObjectId(data.sender);
            data['id_conversations'] = new ObjectId(data.id_conversations);
            const newMessage = await messagesCollection.insertOne(data);

            if (newMessage) {
                return { success: true, data: newMessage }
            } else {
                return { success: false, data: newMessage }
            }
        } catch (error) {
            return { success: false, data: null };
        }
    }
}

module.exports = DataModel;