import { Request, Response } from 'express';

export const getUsers = async (_: Request, res: Response) => {
  res.json([{ id: 1, name: 'Usuário de teste' }]);
};

export const getUserById = async (req: Request, res: Response) => {
  const { id } = req.params;
  res.json({ id, name: 'Usuário ' + id });
};
