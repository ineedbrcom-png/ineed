export declare class FirebaseBridgeService {
    private initialized;
    constructor();
    verifyIdToken(idToken: string): Promise<import("node_modules/firebase-admin/lib/auth/token-verifier").DecodedIdToken>;
}
