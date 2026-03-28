export const calculateInvoice = (data) => {
  let subtotal = 0;

  const items = data.items.map(item => {
    let total = 0;

    if (item.quotedPrice != null) {
      total = item.quotedPrice;
    } else if (item.pricePerDay != null) {
      total = item.days * item.pricePerDay;
    } else if (item.fixedPrice != null) {
      total = item.fixedPrice;
    }

    subtotal += total;

    return { ...item, total };
  });

  let discountAmount = data.discountType === "percent"
    ? (subtotal * data.discount) / 100
    : data.discount;

  if (discountAmount > subtotal) discountAmount = subtotal;

  const finalAmount = subtotal - discountAmount;
  const taxAmount = (finalAmount * data.taxPercent) / 100;
  const grandTotal = finalAmount + taxAmount;
  const dueAmount = Math.max(0, grandTotal - data.paidAmount);

  return {
    items,
    subtotal,
    discountAmount,
    taxAmount,
    grandTotal,
    dueAmount
  };
};