import Currency from '../models/Currency.js';
import Pricing from '../models/Pricing.js';

// Initialize base pricing (USD) - Single source of truth
// Pricing based on: 1 post = ₹499, Conversion rate = 83
export const initializePricing = async () => {
  try {
    const basePricing = [
      { postsPerDay: 1, basePriceUSD: 6.01, planName: 'Basic Plan', planType: 'basic' },        // ₹499 (₹499/post - Base price)
      { postsPerDay: 2, basePriceUSD: 11, planName: 'Standard Plan', planType: 'standard' },    // ₹913 (₹456/post - Save 8%)
      { postsPerDay: 3, basePriceUSD: 15, planName: 'Premium Plan', planType: 'premium' },      // ₹1,245 (₹415/post - Save 17%)
      { postsPerDay: 4, basePriceUSD: 19, planName: 'Premium Plus', planType: 'premium' },      // ₹1,577 (₹394/post - Save 21%)
      { postsPerDay: 5, basePriceUSD: 22, planName: 'Enterprise Plan', planType: 'enterprise' } // ₹1,826 (₹365/post - Save 27%)
    ];

    for (const price of basePricing) {
      await Pricing.findOneAndUpdate(
        { postsPerDay: price.postsPerDay },
        price,
        { upsert: true, new: true }
      );
    }

    console.log('✅ Base pricing initialized (USD)');
  } catch (error) {
    console.error('❌ Pricing initialization error:', error);
  }
};

// Initialize supported currencies
export const initializeCurrencies = async () => {
  try {
    const currencies = [
      {
        code: 'USD',
        symbol: '$',
        name: 'US Dollar',
        conversionRate: 1,
        isActive: true,
        paymentMethod: 'paypal',
        paypalEmail: process.env.PAYPAL_EMAIL 
      },
      {
        code: 'INR',
        symbol: '₹',
        name: 'Indian Rupee',
        conversionRate: 83, // 1 USD = 83 INR
        isActive: true,
        paymentMethod: 'upi',
        upiId: process.env.UPI_ID 
      },
      // Example: Add more currencies as needed
      // {
      //   code: 'EUR',
      //   symbol: '€',
      //   name: 'Euro',
      //   conversionRate: 0.92, // 1 USD = 0.92 EUR
      //   isActive: true,
      //   paymentMethod: 'paypal',
      //   paypalEmail: process.env.PAYPAL_EMAIL || 'your_paypal@example.com'
      // },
      // {
      //   code: 'GBP',
      //   symbol: '£',
      //   name: 'British Pound',
      //   conversionRate: 0.79, // 1 USD = 0.79 GBP
      //   isActive: true,
      //   paymentMethod: 'paypal',
      //   paypalEmail: process.env.PAYPAL_EMAIL || 'your_paypal@example.com'
      // }
    ];

    for (const currencyData of currencies) {
      await Currency.findOneAndUpdate(
        { code: currencyData.code },
        currencyData,
        { upsert: true, new: true }
      );
    }

    console.log('✅ Currencies initialized');
  } catch (error) {
    console.error('❌ Currency initialization error:', error);
  }
};

// Run all initializations
export const initializePaymentSystem = async () => {
  await initializePricing();
  await initializeCurrencies();
};

export default initializePaymentSystem;
