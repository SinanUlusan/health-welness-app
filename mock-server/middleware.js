module.exports = (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');

  if (req.method === 'OPTIONS') {
    res.status(200).send();
    return;
  }

  // Handle Stripe payment intent creation
  if (req.method === 'POST' && req.path === '/payments/create-intent') {

    // Simulate payment intent creation
    const clientSecret = `pi_test_mock_${Date.now()}_secret_${Math.random().toString(36).substr(2, 9)}`;

    res.status(200).json({
      success: true,
      clientSecret: clientSecret,
      message: 'Payment intent created successfully'
    });
    return;
  }

  // Handle Stripe payment processing
  if (req.method === 'POST' && req.path === '/payments/process') {
    const { clientSecret, paymentData } = req.body;

    const cardNumber = paymentData?.cardNumber?.replace(/\s/g, '') || '';
    const isDeclineCard = cardNumber === '4000000000000002';

    const shouldSucceed = !isDeclineCard;

    if (shouldSucceed) {
      res.status(200).json({
        success: true,
        paymentIntent: {
          id: `pi_mock_${Date.now()}`,
          status: 'succeeded',
          amount: 1000,
          currency: 'usd',
          client_secret: clientSecret
        },
        message: 'Payment processed successfully'
      });
    } else {
      res.status(200).json({
        success: false,
        error: 'Payment declined. Please try again with a different card.',
        paymentIntent: null
      });
    }
    return;
  }

  next();
}; 