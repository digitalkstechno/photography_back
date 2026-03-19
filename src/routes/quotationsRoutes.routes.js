import { Router } from "express";

import {
    createQuotation,
    updateQuotation,
    deletQuotation,
    getQuotation
} from "../controllers/quotation.controller.js";


import { authMiddleware } from "../middlewares/auth.middleware.js";


const router = Router();

router.use(authMiddleware);

router.post('/', createQuotation);
router.put('/:id', updateQuotation);
router.delete('/:id', deletQuotation);
router.get('/',getQuotation);
export default router;