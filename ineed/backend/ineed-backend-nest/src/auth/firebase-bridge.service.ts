import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseBridgeService {
  private initialized = false;

  constructor() {
    if (!admin.apps.length) {
      // Tenta inicializar via credenciais padrão do GCloud/GOOGLE_APPLICATION_CREDENTIALS
      admin.initializeApp();
    }
    this.initialized = true;
  }

  async verifyIdToken(idToken: string) {
    if (!this.initialized) throw new Error('Firebase admin not initialized');
    const decoded = await admin.auth().verifyIdToken(idToken);
    // Você pode enriquecer aqui: buscar claims customizadas, etc.
    return decoded; // { uid, email, name, picture, ... }
  }
}
