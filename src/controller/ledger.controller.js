import { ledgerService } from "../services/ledger.service.js";

export const getLedgerEntries = async (req, res, next) => {
  try {
    const data = await ledgerService.findAll(req.query);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

export const getLedgerEntryById = async (req, res, next) => {
  try {
    const data = await ledgerService.findById(Number(req.params.id));
    if (!data) return res.status(404).json({ message: "Entry not found" });
    res.json(data);
  } catch (err) {
    next(err);
  }
};

export const createLedgerEntry = async (req, res, next) => {
  try {
    const payload = req.body;
    if (payload.amount) payload.amount = Number(payload.amount);
    if (payload.partyId) payload.partyId = Number(payload.partyId);
    if (payload.paymentMethodId) payload.paymentMethodId = Number(payload.paymentMethodId);
    if (payload.transactionId) payload.transactionId = Number(payload.transactionId);
    
    // Convert date string to Date object if provided
    if (payload.date) payload.date = new Date(payload.date);
    
    const data = await ledgerService.create(payload);
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
};

export const updateLedgerEntry = async (req, res, next) => {
  try {
    const payload = req.body;
    if (payload.amount) payload.amount = Number(payload.amount);
    if (payload.partyId) payload.partyId = Number(payload.partyId);
    if (payload.paymentMethodId) payload.paymentMethodId = Number(payload.paymentMethodId);
    
    if (payload.date) payload.date = new Date(payload.date);
    
    const data = await ledgerService.update(Number(req.params.id), payload);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

export const deleteLedgerEntry = async (req, res, next) => {
  try {
    await ledgerService.remove(Number(req.params.id));
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};
