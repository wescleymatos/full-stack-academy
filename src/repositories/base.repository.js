class BaseRepository {
    constructor(db, collectionName) {
        this.db = db;
        this.collectionName = collectionName;
    }

    find(conditions) {
        const documents = [];
        const cursor = this.db.collection(this.collectionName).find(conditions);

        return new Promise((resolve, reject) => {
            cursor.forEach(
                (doc) => documents.push((doc)),
                () => resolve(documents)
            )
        });
    }

    insert(document) {
        const collection = this.db.collection(this.collectionName);

        return new Promise((resolve, reject) => {
            collection.insert(document, (err, doc) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(doc);
                }
            })
        });
    }

    remove(documentId) {
        const collection = this.db.collection(this.collectionName);

        return new Promise((resolve, reject) => {
            collection.deleteOne({ _id: documentId }, (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            })
        });
    }

    update(documentId, values) {
        const collection = this.db.collection(this.collectionName);

        return new Promise((resolve, reject) => {
            collection.updateOne(
                { _id: documentId },
                { $set: values },
                (err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(result);
                    }
                }
            )
        });
    }
}

module.exports = BaseRepository;
