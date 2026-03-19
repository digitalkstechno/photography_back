// config/company.js

const companyConfig = {
  id: process.env.COMPANY_ID || "default_company",

  name: process.env.COMPANY_NAME ,

  contact: {
    phone: process.env.COMPANY_PHONE,
    email: process.env.COMPANY_EMAIL ,
    website: process.env.COMPANY_WEBSITE,
  },

  branding: {
    logo: process.env.COMPANY_LOGO || "", // URL
    primaryColor: process.env.COMPANY_PRIMARY_COLOR,
  },

  financial: {
    currency: process.env.COMPANY_CURRENCY || "INR",
    taxRate: Number(process.env.COMPANY_TAX_RATE || 0),
  },

  integrations: {
    razorpay: {
      keyId: process.env.RAZORPAY_KEY_ID || "",
      keySecret: process.env.RAZORPAY_KEY_SECRET || "",
    },
    stripe: {
      apiKey: process.env.STRIPE_API_KEY || "",
    },
  },

  features: {
    enableLedger: true,
    enablePayments: true,
    enableInventory: false,
  },

  meta: {
    createdAt: new Date(),
  },
}

export default companyConfig