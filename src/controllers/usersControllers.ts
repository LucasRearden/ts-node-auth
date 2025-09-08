import { Request, Response } from "express";
import { hashPassword } from "../services/password.services";
import prisma from "../models/user"; // asumiendo que expone prisma.user.*

type IdParams = { id: string };

export const createUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        if (!password) {
            res.status(400).json({ message: "El password es obligatorio" });
            return;
        }
        if (!email) {
            res.status(400).json({ message: "El email es obligatorio" });
            return;
        }

        const hashedPassword = await hashPassword(password);

        const user = await prisma.create({
            data: { email, password: hashedPassword },
        });

        res.status(201).json(user);
    } catch (error: any) {
        if (error?.code === "P2002" && error?.meta?.target?.includes("email")) {
            res.status(400).json({ message: "El email ingresado ya existe" });
            return;
        }
        console.error(error);
        res.status(500).json({ error: "Hubo un error, pruebe más tarde" });
    }
};

export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
    try {
        const users = await prisma.findMany();
        res.status(200).json(users);
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ error: "Hubo un error, pruebe más tarde" });
    }
};

export const getUserById = async (
    req: Request<IdParams>,
    res: Response
): Promise<void> => {
    try {
        const { id } = req.params;
        if (!id) {
            res.status(400).json({ error: "ID no proporcionado" });
            return;
        }
        const userId = Number(id);
        if (Number.isNaN(userId)) {
            res.status(400).json({ error: "ID inválido" });
            return;
        }

        const user = await prisma.findUnique({ where: { id: userId } });
        if (!user) {
            res.status(404).json({ error: "El usuario no fue encontrado" });
            return;
        }
        res.status(200).json(user);
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ error: "Hubo un error, pruebe más tarde" });
    }
};

export const updateUser = async (
    req: Request<IdParams>,
    res: Response
): Promise<void> => {
    try {
        const { id } = req.params;
        if (!id) {
            res.status(400).json({ error: "ID no proporcionado" });
            return;
        }
        const userId = Number(id);
        if (Number.isNaN(userId)) {
            res.status(400).json({ error: "ID inválido" });
            return;
        }

        const { email, password } = req.body as { email?: string; password?: string };
        const dataToUpdate: Record<string, unknown> = {};

        if (typeof email === "string") dataToUpdate.email = email;
        if (typeof password === "string") {
            dataToUpdate.password = await hashPassword(password);
        }

        const user = await prisma.update({
            where: { id: userId },
            data: dataToUpdate,
        });

        res.status(200).json(user);
    } catch (error: any) {
        if (error?.code === "P2002" && error?.meta?.target?.includes("email")) {
            res.status(400).json({ error: "El email ingresado ya existe" });
        } else if (error?.code === "P2025") {
            res.status(404).json({ error: "Usuario no encontrado" });
        } else {
            console.error(error);
            res.status(500).json({ error: "Hubo un error, pruebe más tarde" });
        }
    }
};

export const deleteUser = async (
    req: Request<IdParams>,
    res: Response
): Promise<void> => {
    try {
        const { id } = req.params;
        if (!id) {
            res.status(400).json({ error: "ID no proporcionado" });
            return;
        }
        const userId = Number(id);
        if (Number.isNaN(userId)) {
            res.status(400).json({ error: "ID inválido" });
            return;
        }

        await prisma.delete({ where: { id: userId } });

        res.status(200).json({ message: `El usuario ${userId} ha sido eliminado` });
    } catch (error: any) {
        if (error?.code === "P2025") {
            res.status(404).json({ error: "Usuario no encontrado" });
        } else {
            console.error(error);
            res
                .status(500)
                .json({ error: "Hubo un error, pruebe más tarde" });
        }
    }
};
