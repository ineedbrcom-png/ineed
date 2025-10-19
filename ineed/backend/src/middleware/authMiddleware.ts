import { Request, Response, NextFunction } from 'express';
import admin from 'firebase-admin';

// Estendemos a interface Request para poder adicionar os dados do usuário nela
export interface AuthenticatedRequest extends Request {
    user?: admin.auth.DecodedIdToken;
}

const authMiddleware = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const { authorization } = req.headers;

    if (!authorization || !authorization.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Token de autorização ausente ou mal formatado.' });
    }

    const idToken = authorization.split('Bearer ')[1];

    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        req.user = decodedToken; // Adiciona os dados do usuário decodificados na requisição
        next(); // Permite que a requisição continue para a rota principal
    } catch (error) {
        console.error('Erro ao verificar o token:', error);
        return res.status(403).json({ message: 'Token inválido ou expirado.' });
    }
};

export default authMiddleware;