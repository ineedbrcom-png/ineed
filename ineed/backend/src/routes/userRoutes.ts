import { Router } from 'express';
import authMiddleware, { AuthenticatedRequest } from '../middleware/authMiddleware';
import firestore from '../firestoreClient';
import { getStorage } from 'firebase-admin/storage';

const router = Router();

// ROTA PROTEGIDA (GET /api/users/me)
// Note o 'authMiddleware' aqui. Ele é o segurança na porta desta rota.
router.get('/me', authMiddleware, async (req: AuthenticatedRequest, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Nenhum usuário autenticado encontrado.' });
        }

        const userId = req.user.uid;
        const userDoc = await firestore.collection('usuarios').doc(userId).get();

        if (!userDoc.exists) {
            return res.status(404).json({ message: 'Perfil de usuário não encontrado no banco de dados.' });
        }

        res.status(200).json(userDoc.data());

    } catch (error) {
        console.error("Erro ao buscar perfil:", error);
        res.status(500).json({ message: 'Erro ao buscar dados do perfil.' });
    }
});

// ROTA PÚBLICA PARA OBTER PERFIL DE UM USUÁRIO (GET /api/users/:id)
router.get('/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        const userDoc = await firestore.collection('usuarios').doc(userId).get();

        if (!userDoc.exists) {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }

        const userData = userDoc.data();

        // Filtramos os dados para retornar apenas informações públicas
        const publicProfile = {
            id: userData.id,
            nome: userData.nome,
            avatarUrl: userData.avatarUrl,
            bio: userData.bio,
            membroDesde: userData.membroDesde,
            reputacao: userData.reputacao,
            // NUNCA inclua e-mail ou outras informações privadas aqui
        };

        res.status(200).json(publicProfile);
    } catch (error) {
        console.error("Erro ao buscar perfil público:", error);
        res.status(500).json({ message: 'Erro ao buscar dados do usuário.' });
    }
});

// ROTA PARA ATUALIZAR DADOS DO USUÁRIO LOGADO (PUT /api/users/me)
router.put('/me', authMiddleware, async (req: AuthenticatedRequest, res) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Não autorizado.' });
    }

    const { uid } = req.user;
    // Aceita qualquer campo que o frontend enviar (nome, bio, avatarUrl, etc.)
    const updatableData = req.body;

    if (Object.keys(updatableData).length === 0) {
        return res.status(400).json({ message: 'Nenhum dado para atualizar foi fornecido.' });
    }

    try {
        const userRef = firestore.collection('usuarios').doc(uid);
        // O método 'set' com 'merge: true' é seguro e só atualiza os campos enviados.
        await userRef.set(updatableData, { merge: true });
        const updatedUserDoc = await userRef.get();
        res.status(200).json(updatedUserDoc.data());
    } catch (error) {
        console.error("Erro ao atualizar perfil do usuário:", error);
        res.status(500).json({ message: 'Erro ao atualizar perfil.' });
    }
});

// ROTA PARA GERAR UMA URL DE UPLOAD ASSINADA (POST /api/users/me/upload-url)
router.post('/me/upload-url', authMiddleware, async (req: AuthenticatedRequest, res) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Não autorizado.' });
    }

    const { uid } = req.user;
    const { contentType } = req.body; // ex: 'image/jpeg'

    if (!contentType) {
        return res.status(400).json({ message: 'O tipo de conteúdo (contentType) é obrigatório.' });
    }

    try {
        const bucket = getStorage().bucket();
        // O nome do arquivo será o próprio UID do usuário para garantir que cada um tenha apenas uma foto.
        const filePath = `profile-pictures/${uid}/${uid}`;
        const file = bucket.file(filePath);

        const [signedUrl] = await file.getSignedUrl({
            version: 'v4',
            action: 'write',
            expires: Date.now() + 15 * 60 * 1000, // 15 minutos para fazer o upload
            contentType: contentType,
        });

        // O URL público para salvar no Firestore depois
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;

        res.status(200).json({ signedUrl, publicUrl });
    } catch (error) {
        console.error("Erro ao gerar URL de upload:", error);
        res.status(500).json({ message: 'Erro ao preparar o upload da imagem.' });
    }
});

export default router;