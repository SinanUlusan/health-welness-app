import express from 'express';
import cors from 'cors';

const app = express();

// CORS middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));

// Mock data
const mockData = {
  plans: [
    {
      id: "free-trial",
      name: "Free Trial",
      price: 0,
      isFree: true,
      duration: "7 days",
    },
    {
      id: "1-month",
      name: "1 Month",
      price: 9.99,
      isFree: false,
      duration: "1 month",
    },
    {
      id: "3-months",
      name: "3 Months",
      price: 24.99,
      isFree: false,
      duration: "3 months",
    },
  ],
  subscriptionPlans: [
    {
      id: "free-trial",
      name: "7 days free trial",
      duration: "1 year",
      price: 0,
      isFree: true,
      isPopular: true,
    },
    {
      id: "3-months",
      name: "3 months",
      duration: "",
      price: 8.4,
      originalPrice: 11.6,
      discount: 29,
    },
    {
      id: "1-month",
      name: "1 month",
      duration: "",
      price: 11.6,
    },
  ],
  lunchTypes: [
    {
      id: "sandwiches",
      value: "sandwiches",
      labelKey: "onboarding.lunchTypes.sandwiches",
      emoji: "🥪",
    },
    {
      id: "soups",
      value: "soups",
      labelKey: "onboarding.lunchTypes.soups",
      emoji: "🥗",
    },
    {
      id: "fast_food",
      value: "fastfood",
      labelKey: "onboarding.lunchTypes.fastFood",
      emoji: "🍟",
    },
    {
      id: "other",
      value: "other",
      labelKey: "onboarding.lunchTypes.other",
      emoji: "👀",
    },
  ],
  testimonials: [
    {
      id: "testimonial-1",
      name: "Yasmine, -8 kg",
      ratingTitle: "Improved digestion",
      text: "My customized fasting plan really helped me with my stomach cramps and bloating problems.",
      stars: 5,
      beforeImage: "testimonial-before.png",
      afterImage: "testimonial-after.png",
    },
    {
      id: "testimonial-2",
      name: "Jennifer, -12 kg",
      ratingTitle: "Better energy levels",
      text: "I feel so much more energetic throughout the day. The plan is easy to follow and very effective.",
      stars: 5,
      beforeImage: "fat-body.png",
      afterImage: "skinny-body.png",
    },
    {
      id: "testimonial-3",
      name: "Sarah, -6 kg",
      ratingTitle: "Amazing results",
      text: "The personalized approach made all the difference. I've never felt better about my body.",
      stars: 5,
      beforeImage: "testimonial-before.png",
      afterImage: "testimonial-after.png",
    },
    {
      id: "testimonial-4",
      name: "Claire, -10 kg",
      ratingTitle: "Life changing",
      text: "This app changed my relationship with food completely. The results speak for themselves.",
      stars: 5,
      beforeImage: "testimonial-before.png",
      afterImage: "testimonial-after.png",
    },
  ],
  reviews: [
    {
      id: "review-1",
      title: "Fascinating!",
      emoji: "🔥",
      stars: 5,
      content: "My customized fasting plan really helped me with my stomach cramps and bloating problems.",
      reviewer: "Kumsalp",
      reviewDate: "Nov 22",
    },
    {
      id: "review-2",
      title: "Awesome!",
      emoji: "⭐",
      stars: 5,
      content: "The personalized approach made all the difference. I've never felt better about my body.",
      reviewer: "Mertoz",
      reviewDate: "Nov 20",
    },
    {
      id: "review-3",
      title: "Incredible!",
      emoji: "💪",
      stars: 5,
      content: "This app changed my relationship with food completely. The results speak for themselves.",
      reviewer: "Ahmed",
      reviewDate: "Nov 18",
    },
    {
      id: "review-4",
      title: "Amazing!",
      emoji: "✨",
      stars: 4,
      content: "I feel so much more energetic throughout the day. The plan is easy to follow and very effective.",
      reviewer: "Sarah",
      reviewDate: "Nov 15",
    },
  ],
  countries: [
    {
      id: "turkey",
      code: "TR",
      nameKey: "paywall.countries.turkey",
    },
    {
      id: "united-states",
      code: "US",
      nameKey: "paywall.countries.unitedStates",
    },
    {
      id: "united-kingdom",
      code: "GB",
      nameKey: "paywall.countries.unitedKingdom",
    },
    {
      id: "germany",
      code: "DE",
      nameKey: "paywall.countries.germany",
    },
    {
      id: "france",
      code: "FR",
      nameKey: "paywall.countries.france",
    },
    {
      id: "spain",
      code: "ES",
      nameKey: "paywall.countries.spain",
    },
    {
      id: "italy",
      code: "IT",
      nameKey: "paywall.countries.italy",
    },
    {
      id: "canada",
      code: "CA",
      nameKey: "paywall.countries.canada",
    },
    {
      id: "australia",
      code: "AU",
      nameKey: "paywall.countries.australia",
    },
    {
      id: "netherlands",
      code: "NL",
      nameKey: "paywall.countries.netherlands",
    },
  ],
};

// API Routes
app.get('/api/plans', (req, res) => {
  res.json(mockData.plans);
});

app.get('/api/subscriptionPlans', (req, res) => {
  res.json(mockData.subscriptionPlans);
});

app.get('/api/lunchTypes', (req, res) => {
  res.json(mockData.lunchTypes);
});

app.get('/api/testimonials', (req, res) => {
  res.json(mockData.testimonials);
});

app.get('/api/reviews', (req, res) => {
  res.json(mockData.reviews);
});

app.get('/api/countries', (req, res) => {
  res.json(mockData.countries);
});

app.post('/api/onboarding', (req, res) => {
  const { step, data } = req.body;

  if (step === 1 && !data.lunchType) {
    return res.status(400).json({ error: "Lunch type is required" });
  }

  if (step === 2 && (!data.weight || data.weight <= 0)) {
    return res.status(400).json({ error: "Valid weight is required" });
  }

  res.json({ success: true, data });
});

app.post('/api/payments', (req, res) => {
  const { paymentInfo, planId } = req.body;

  // Validate payment info
  if (!paymentInfo.email || !paymentInfo.country) {
    return res.status(400).json({ error: "Email and country are required" });
  }

  if (paymentInfo.paymentMethod === "card") {
    if (!paymentInfo.cardNumber || !paymentInfo.expirationMonth || !paymentInfo.expirationYear || !paymentInfo.cvc) {
      return res.status(400).json({ error: "Card details are required" });
    }
  }

  const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  res.json({
    success: true,
    transactionId,
    message: "Payment processed successfully"
  });
});

app.post('/api/payment', (req, res) => {
  const paymentInfo = req.body;

  // Validate payment info
  if (!paymentInfo.email || !paymentInfo.country) {
    return res.status(400).json({ error: "Email and country are required" });
  }

  if (paymentInfo.paymentMethod === "card") {
    if (!paymentInfo.cardNumber || !paymentInfo.expirationMonth || !paymentInfo.expirationYear || !paymentInfo.cvc) {
      return res.status(400).json({ error: "Card details are required" });
    }
  }

  const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  res.json({
    success: true,
    transactionId,
    status: "succeeded"
  });
});

// Handle all other routes
app.use('*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

export default app;
