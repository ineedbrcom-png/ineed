import express from 'express';
import cors from 'cors';
import admin from 'firebase-admin';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';

admin.initializeApp();

const app = express();

app.use(cors({ origin: 'http://localhost:3001' }));
app.use(express.json());

app.get('/', (req, res) => {
  res.send('🚀 iNeed Backend está no ar e pronto para decolar!');
});

// NOSSAS ROTAS DE API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});