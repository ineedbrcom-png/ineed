import { Router, Request, Response } from 'express';
import admin from 'firebase-admin';
import firestore from '../firestoreClient'; // Importa nosso cliente do Firestore

const router = Router();

// ROTA DE CADASTRO (POST /api/auth/register)
router.post('/register', async (req: Request, res: Response) => {
    try {
        const { email, password, nome } = req.body;

        // 1. Validação básica
        if (!email || !password || !nome) {
            return res.status(400).json({ message: 'E-mail, senha e nome são obrigatórios.' });
        }

        // 2. Criar o usuário no Firebase Authentication
        const userRecord = await admin.auth().createUser({
            email: email,
            password: password,
            displayName: nome,
        });

        const newUserProfile = {
            id: userRecord.uid, // Adicionando o UID como id
            nome: nome,
            email: email,
            reputacao: 5, // Reputação inicial
            membroDesde: new Date(),
            avatarUrl: `https://i.pravatar.cc/150?u=${userRecord.uid}`,
            bio: 'Novo membro da comunidade iNeed!',
        };

        // 3. Criar um perfil para o usuário no nosso banco de dados Firestore
        await firestore.collection('usuarios').doc(userRecord.uid).set(newUserProfile);

        // 4. Gerar um token de autenticação para o novo usuário
        const token = await admin.auth().createCustomToken(userRecord.uid);

        // 5. Enviar uma resposta de sucesso com o token e os dados do usuário
        return res.status(201).json({
            token: token,
            user: newUserProfile
        });

    } catch (error: any) {
        console.error("Erro no cadastro:", error);
        // Tratar erros comuns do Firebase
        if (error.code === 'auth/email-already-exists') {
            return res.status(409).json({ message: 'Este e-mail já está em uso.' });
        }
        return res.status(500).json({ message: 'Ocorreu um erro ao criar o usuário.' });
    }
});

// ROTA DE LOGIN (POST /api/auth/login)
router.post('/login', async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        
        // Embora a senha seja recebida, o Firebase Admin SDK não a usa para
        // validar diretamente como em um banco de dados tradicional. A validação
        // principal da senha ocorre no lado do cliente com o SDK do Firebase.
        // Aqui, usamos o email para encontrar o usuário e gerar um token.
        
        if (!email) {
            return res.status(400).json({ message: 'E-mail é obrigatório.' });
        }

        // 1. Encontrar o usuário pelo e-mail no Firebase Authentication
        const userRecord = await admin.auth().getUserByEmail(email);

        // 2. Buscar o perfil do usuário no Firestore
        const userProfileDoc = await firestore.collection('usuarios').doc(userRecord.uid).get();
        if (!userProfileDoc.exists) {
            return res.status(404).json({ message: 'Perfil de usuário não encontrado.' });
        }
        const userProfile = userProfileDoc.data();

        // 3. Gerar um token de autenticação personalizado
        const token = await admin.auth().createCustomToken(userRecord.uid);

        // 4. Enviar a resposta com o token e os dados do usuário
        return res.status(200).json({ token, user: userProfile });

    } catch (error: any) {
        console.error("Erro no login:", error);
        if (error.code === 'auth/user-not-found') {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }
        return res.status(500).json({ message: 'Falha na autenticação.' });
    }
});

export default router;