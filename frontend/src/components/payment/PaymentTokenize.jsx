import { useState, useCallback } from 'react';
import { CreditCard, Lock, AlertCircle } from 'lucide-react';

/**
 * Payment Tokenize Component
 * 
 * IMPORTANT: This is a simulation of client-side tokenization.
 * In production, use Stripe.js/Elements or Braintree Drop-in UI.
 * Card data should NEVER touch your server - only tokens should be sent.
 * 
 * This component simulates the tokenization process that would
 * happen in a real payment processor's iframe.
 */

const CARD_PATTERNS = {
  visa: /^4[0-9]{12}(?:[0-9]{3})?$/,
  mastercard: /^5[1-5][0-9]{14}$|^2(?:2(?:2[1-9]|[3-9][0-9])|[3-6][0-9][0-9]|7(?:[01][0-9]|20))[0-9]{12}$/,
  amex: /^3[47][0-9]{13}$/,
  discover: /^6(?:011|5[0-9]{2})[0-9]{12}$/,
};

const detectCardType = (number) => {
  const cleanNumber = number.replace(/\s/g, '');
  for (const [type, pattern] of Object.entries(CARD_PATTERNS)) {
    if (pattern.test(cleanNumber)) {
      return type;
    }
  }
  return 'unknown';
};

const formatCardNumber = (value) => {
  const cleanValue = value.replace(/\D/g, '');
  const groups = cleanValue.match(/.{1,4}/g);
  return groups ? groups.join(' ') : '';
};

const formatExpiry = (value) => {
  const cleanValue = value.replace(/\D/g, '');
  if (cleanValue.length >= 2) {
    return cleanValue.slice(0, 2) + '/' + cleanValue.slice(2, 4);
  }
  return cleanValue;
};

const validateCard = (cardNumber, expiry, cvv) => {
  const errors = {};
  
  // Validate card number (Luhn algorithm)
  const cleanNumber = cardNumber.replace(/\s/g, '');
  if (cleanNumber.length < 13 || cleanNumber.length > 19) {
    errors.card_number = 'Invalid card number length';
  } else {
    // Luhn algorithm
    let sum = 0;
    let isEven = false;
    for (let i = cleanNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(cleanNumber[i], 10);
      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }
      sum += digit;
      isEven = !isEven;
    }
    if (sum % 10 !== 0) {
      errors.card_number = 'Invalid card number';
    }
  }
  
  // Validate expiry
  const [month, year] = expiry.split('/');
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear() % 100;
  const currentMonth = currentDate.getMonth() + 1;
  
  if (!month || !year) {
    errors.expiry = 'Invalid expiry date';
  } else if (parseInt(month, 10) < 1 || parseInt(month, 10) > 12) {
    errors.expiry = 'Invalid month';
  } else if (parseInt(year, 10) < currentYear || 
             (parseInt(year, 10) === currentYear && parseInt(month, 10) < currentMonth)) {
    errors.expiry = 'Card expired';
  }
  
  // Validate CVV
  if (!cvv || cvv.length < 3 || cvv.length > 4) {
    errors.cvv = 'Invalid CVV';
  }
  
  return errors;
};

/**
 * Simulate tokenization (in production, this would be done by Stripe.js)
 * Returns a fake token that simulates what Stripe would return
 */
const simulateTokenization = async (cardData) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // In production, this would be:
  // const { token, error } = await stripe.createToken(cardElement);
  
  // For demo purposes, return a fake token
  return {
    success: true,
    token: `tok_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    card_type: detectCardType(cardData.card_number),
    last_4: cardData.card_number.replace(/\s/g, '').slice(-4),
    expiry_month: cardData.expiry.split('/')[0],
    expiry_year: cardData.expiry.split('/')[1],
  };
};

export default function PaymentTokenize({ onTokenize, onError }) {
  const [cardData, setCardData] = useState({
    card_number: '',
    expiry: '',
    cvv: '',
    cardholder_name: '',
  });
  const [errors, setErrors] = useState({});
  const [processing, setProcessing] = useState(false);
  const [cardType, setCardType] = useState('unknown');

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    
    let formattedValue = value;
    let newErrors = { ...errors };
    
    switch (name) {
      case 'card_number':
        formattedValue = formatCardNumber(value);
        setCardType(detectCardType(formattedValue));
        if (newErrors.card_number) {
          delete newErrors.card_number;
        }
        break;
      case 'expiry':
        formattedValue = formatExpiry(value);
        if (newErrors.expiry) {
          delete newErrors.expiry;
        }
        break;
      case 'cvv':
        formattedValue = value.replace(/\D/g, '').slice(0, 4);
        if (newErrors.cvv) {
          delete newErrors.cvv;
        }
        break;
      case 'cardholder_name':
        formattedValue = value;
        if (newErrors.cardholder_name) {
          delete newErrors.cardholder_name;
        }
        break;
    }
    
    setCardData(prev => ({ ...prev, [name]: formattedValue }));
    setErrors(newErrors);
  }, [errors]);

  const handleTokenize = async () => {
    const validationErrors = validateCard(
      cardData.card_number,
      cardData.expiry,
      cardData.cvv
    );
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    setProcessing(true);
    setErrors({});
    
    try {
      const tokenResult = await simulateTokenization(cardData);
      
      if (tokenResult.success) {
        // IMPORTANT: Only send the token to the backend, never raw card data
        onTokenize({
          token: tokenResult.token,
          card_type: tokenResult.card_type,
          last_4: tokenResult.last_4,
          expiry_month: tokenResult.expiry_month,
          expiry_year: tokenResult.expiry_year,
          cardholder_name: cardData.cardholder_name,
        });
      } else {
        onError('Failed to tokenize card. Please try again.');
      }
    } catch (err) {
      onError('Payment processing error. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const getCardTypeIcon = () => {
    switch (cardType) {
      case 'visa':
        return '💳 Visa';
      case 'mastercard':
        return '💳 Mastercard';
      case 'amex':
        return '💳 American Express';
      case 'discover':
        return '💳 Discover';
      default:
        return <CreditCard className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-surface-600 dark:text-surface-400 mb-4">
        <Lock className="w-4 h-4" />
        <span>Card data is tokenized client-side and never touches our server</span>
      </div>

      {/* Card Number */}
      <div>
        <label htmlFor="card_number" className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
          Card Number
        </label>
        <div className="relative">
          <input
            type="text"
            id="card_number"
            name="card_number"
            value={cardData.card_number}
            onChange={handleChange}
            placeholder="1234 5678 9012 3456"
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-marsana-500 focus:border-marsana-500 dark:bg-surface-800 dark:border-surface-700 dark:text-white ${
              errors.card_number ? 'border-red-500' : 'border-surface-300 dark:border-surface-600'
            }`}
            maxLength={19}
            autoComplete="cc-number"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-surface-500">
            {getCardTypeIcon()}
          </div>
        </div>
        {errors.card_number && (
          <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {errors.card_number}
          </p>
        )}
      </div>

      {/* Expiry and CVV */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="expiry" className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
            Expiry Date
          </label>
          <input
            type="text"
            id="expiry"
            name="expiry"
            value={cardData.expiry}
            onChange={handleChange}
            placeholder="MM/YY"
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-marsana-500 focus:border-marsana-500 dark:bg-surface-800 dark:border-surface-700 dark:text-white ${
              errors.expiry ? 'border-red-500' : 'border-surface-300 dark:border-surface-600'
            }`}
            maxLength={5}
            autoComplete="cc-exp"
          />
          {errors.expiry && (
            <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.expiry}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="cvv" className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
            CVV
          </label>
          <input
            type="text"
            id="cvv"
            name="cvv"
            value={cardData.cvv}
            onChange={handleChange}
            placeholder="123"
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-marsana-500 focus:border-marsana-500 dark:bg-surface-800 dark:border-surface-700 dark:text-white ${
              errors.cvv ? 'border-red-500' : 'border-surface-300 dark:border-surface-600'
            }`}
            maxLength={4}
            autoComplete="cc-csc"
          />
          {errors.cvv && (
            <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.cvv}
            </p>
          )}
        </div>
      </div>

      {/* Cardholder Name */}
      <div>
        <label htmlFor="cardholder_name" className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
          Cardholder Name
        </label>
        <input
          type="text"
          id="cardholder_name"
          name="cardholder_name"
          value={cardData.cardholder_name}
          onChange={handleChange}
          placeholder="John Doe"
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-marsana-500 focus:border-marsana-500 dark:bg-surface-800 dark:border-surface-700 dark:text-white ${
            errors.cardholder_name ? 'border-red-500' : 'border-surface-300 dark:border-surface-600'
          }`}
          autoComplete="cc-name"
        />
        {errors.cardholder_name && (
          <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {errors.cardholder_name}
          </p>
        )}
      </div>

      {/* Tokenize Button */}
      <button
        onClick={handleTokenize}
        disabled={processing}
        className="w-full px-6 py-3 bg-marsana-600 text-white rounded-lg hover:bg-marsana-700 focus:ring-2 focus:ring-marsana-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {processing ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Processing...
          </span>
        ) : (
          'Tokenize Card'
        )}
      </button>

      <p className="text-xs text-surface-500 dark:text-surface-400 text-center">
        This is a demo. In production, use Stripe.js for PCI-DSS compliant tokenization.
      </p>
    </div>
  );
}