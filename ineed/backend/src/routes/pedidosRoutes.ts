import { Router } from 'express';
import authMiddleware, { AuthenticatedRequest } from '../middleware/authMiddleware';
import firestore from '../firestoreClient';

const router = Router();

// ROTA PARA LISTAR TODOS OS PEDIDOS (GET /api/pedidos)
// Esta rota é PÚBLICA.
router.get('/', async (req, res) => {
    try {
        const pedidosSnapshot = await firestore.collection('pedidos').get();
        const pedidos = pedidosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.status(200).json(pedidos);
    } catch (error) {
        console.error("Erro ao listar pedidos:", error);
        res.status(500).json({ message: 'Erro ao buscar pedidos.' });
    }
});

// ROTA PARA CRIAR UM NOVO PEDIDO (POST /api/pedidos)
// Esta rota é PROTEGIDA pelo nosso authMiddleware.
router.post('/', authMiddleware, async (req: AuthenticatedRequest, res) => {
    try {
        const { titulo, descricao, categoria } = req.body;
        const autorId = req.user?.uid; // ID do usuário logado (vem do middleware)

        if (!titulo || !descricao || !categoria) {
            return res.status(400).json({ message: 'Título, descrição e categoria são obrigatórios.' });
        }

        const novoPedido = {
            titulo,
            descricao,
            categoria,
            autorId,
            autorNome: req.user?.name || 'Anônimo', // Nome do usuário (vem do token)
            status: 'ativo',
            criadoEm: new Date(),
        };

        const docRef = await firestore.collection('pedidos').add(novoPedido);
        
        res.status(201).json({ message: 'Pedido criado com sucesso!', id: docRef.id });

    } catch (error) {
        console.error("Erro ao criar pedido:", error);
        res.status(500).json({ message: 'Erro ao criar pedido.' });
    }
});

export default router;