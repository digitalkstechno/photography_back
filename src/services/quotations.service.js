import prisma  from "../config/prisma.js";
import { BaseService } from "../core/classbase.service.js";

class QuotationService extends BaseService{
    constructor(){
        console.log(prisma)
        super(prisma.quotation)
    }
}

export const quotationService = new QuotationService();