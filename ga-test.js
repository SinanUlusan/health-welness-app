// Google Analytics Test Script
// You can run this script in the browser console to test if GA is working

// 1. Check if GA is loaded
console.log('🔍 Google Analytics Test');
console.log('GA Tracking ID:', import.meta.env.VITE_GA_TRACKING_ID);
console.log('Is Production:', import.meta.env.PROD);
console.log('Enable Local:', import.meta.env.VITE_ENABLE_ANALYTICS_LOCAL);

// 2. Check dataLayer
if (window.dataLayer) {
  console.log('✅ dataLayer exists:', window.dataLayer);
} else {
  console.log('❌ dataLayer not found');
}

// 3. Check gtag function
if (window.gtag) {
  console.log('✅ gtag function exists');

  // Send test event
  window.gtag('event', 'test_event', {
    event_category: 'test',
    event_label: 'local_test',
    value: 1
  });
  console.log('📊 Test event sent');
} else {
  console.log('❌ gtag function not found');
}

// 4. Test all analytics functions
console.log('🧪 Test analytics functions:');
console.log('- trackEvent()');
console.log('- trackPageView()');
console.log('- trackOnboardingStep()');
console.log('- trackPaymentEvent()');

// 5. Open Google Analytics Debugger
console.log('🔧 Google Analytics Debugger:');
console.log('https://chrome.google.com/webstore/detail/google-analytics-debugger/jnkmfdileelhofjcijamephohjechhna');
console.log('You can see GA events in real-time with this extension'); 