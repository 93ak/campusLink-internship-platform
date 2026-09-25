import { Router } from "express";
import Professor from "../models/Professor.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const router = Router();

router.get(
  "/",
  asyncHandler(async (req, res) => {
    res.json(await Professor.find().sort({ name: 1 }));
  })
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const professor = await Professor.findById(req.params.id);
    if (!professor) return res.status(404).json({ error: "Professor not found" });
    res.json(professor);
  })
);

export default router;
