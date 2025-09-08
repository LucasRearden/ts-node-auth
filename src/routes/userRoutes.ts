import express from "express";
import jwt, { JwtPayload, VerifyErrors } from "jsonwebtoken";
import { createUser, deleteUser, getAllUsers, getUserById, updateUser } from "../controllers/usersControllers";

const router = express.Router();

// Asegurá un string:
const JWT_SECRET: string = process.env.JWT_SECRET ?? "default-secret";

// Middleware
export const authenticateToken: express.RequestHandler = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({ error: "No autorizado" });
    }

    jwt.verify(
        token,
        JWT_SECRET,
        (err: VerifyErrors | null, decoded: JwtPayload | string | undefined) => {
            if (err) {
                console.error("Error en autenticación", err);
                return res
                    .status(403)
                    .json({ error: "No tienes acceso a este recurso" });
            }
            // opcional: guardar el payload en req.user
            (req as any).user = decoded;
            next();
        }
    );
};

// Rutas de ejemplo
router.post("/", authenticateToken, createUser);
router.get("/", authenticateToken, getAllUsers);
router.get("/:id", authenticateToken, getUserById);
router.put("/:id", authenticateToken, updateUser);
router.delete("/:id", authenticateToken, deleteUser);

export default router;
