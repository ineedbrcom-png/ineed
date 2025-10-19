import { Firestore } from '@google-cloud/firestore';

// Ao não especificar um databaseId, a biblioteca
// usa automaticamente o banco de dados '(default)'.
const firestore = new Firestore();

export default firestore;