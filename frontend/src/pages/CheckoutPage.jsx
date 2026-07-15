import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Loader2,
  MapPin,
  CreditCard,
  ClipboardCheck,
  Check,
  Truck,
  ArrowLeft,
  Lock,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { profileService } from '../services/api/profileService';
import { checkoutService } from '../services/api/checkoutService';
import { formatPrice } from '../utils/format';

const STEPS = [
  { id: 'shipping', label: 'Shipping', icon: MapPin },
  { id: 'payment', label: 'Payment', icon: CreditCard },
  { id: 'review', label: 'Review', icon: ClipboardCheck },
];

const EMPTY_ADDRESS = {
  first_name: '',
  last_name: '',
  phone_number: '',
  address_line_1: '',
  address_line_2: '',
  city: '',
  state: '',
  postal_code: '',
  country: '',
};

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { cart, fetchCart } = useCart();

  const [currentStep, setCurrentStep] = useState('shipping');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [placing, setPlacing] = useState(false);

  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedShippingAddressId, setSelectedShippingAddressId] = useState(null);
  const [selectedBillingAddressId, setSelectedBillingAddressId] = useState(null);

  const [shippingForm, setShippingForm] = useState({ ...EMPTY_ADDRESS });
  const [billingForm, setBillingForm] = useState({ ...EMPTY_ADDRESS });
  const [billingSameAsShipping, setBillingSameAsShipping] = useState(true);
  const [deliveryType, setDeliveryType] = useState('shipping');
  const [shippingMethod, setShippingMethod] = useState('');
  const [shippingMethods, setShippingMethods] = useState([]);
  const [pickupLocations, setPickupLocations] = useState([]);
  const [selectedPickupLocation, setSelectedPickupLocation] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [cardDetails, setCardDetails] = useState({
    card_number: '',
    expiry: '',
    cvv: '',
    cardholder_name: '',
  });
  const [notes, setNotes] = useState('');
  const [termsAgreed, setTermsAgreed] = useState(false);

  const loadAddresses = async () => {
    try {
      const response = await profileService.getAddresses();
      if (response.success) {
        setSavedAddresses(response.data || []);
        const defaultShipping = response.data?.find(
          (a) => a.address_type === 'shipping' && a.is_default
        );
        if (defaultShipping) {
          setSelectedShippingAddressId(defaultShipping.id);
        }
        const defaultBilling = response.data?.find(
          (a) => a.address_type === 'billing' && a.is_default
        );
        if (defaultBilling) {
          setSelectedBillingAddressId(defaultBilling.id);
          setBillingSameAsShipping(false);
        }
      }
    } catch (error) {
      console.error('Failed to load addresses:', error);
    }
  };

  const loadShippingMethods = async () => {
    try {
      const address = {
        country: shippingForm.country || 'US',
        state: shippingForm.state || null,
        postal_code: shippingForm.postal_code || null,
      };
      const response = await checkoutService.getShippingMethods(address, cart.summary?.subtotal || 0);
      if (response.success) {
        setShippingMethods(response.data || []);
        if (response.data?.length > 0 && !shippingMethod) {
          setShippingMethod(response.data[0].id);
        }
      }
    } catch {
      setShippingMethods([
        { id: 'standard', name: 'Standard Shipping', cost: 5.99, estimated_days_min: 5, estimated_days_max: 7, free_shipping: (cart.summary?.subtotal || 0) >= 50 },
      ]);
      if (!shippingMethod) setShippingMethod('standard');
    }
  };

  const loadPickupLocations = async () => {
    try {
      const response = await checkoutService.getPickupLocations();
      if (response.success) {
        setPickupLocations(response.data || []);
      }
    } catch (error) {
      console.error('Failed to load pickup locations:', error);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadAddresses();
    }
    loadPickupLocations();
  }, [isAuthenticated]);

  useEffect(() => {
    if (cart.items.length === 0 && !loading && !placing) {
      navigate('/cart');
    }
  }, [cart.items, loading, navigate, placing]);

  useEffect(() => {
    if (deliveryType === 'shipping') {
      loadShippingMethods();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deliveryType, shippingForm.country, shippingForm.state, shippingForm.postal_code, cart.summary?.subtotal]);

  const handleShippingChange = (e) => {
    setShippingForm({ ...shippingForm, [e.target.name]: e.target.value });
  };

  const handleBillingChange = (e) => {
    setBillingForm({ ...billingForm, [e.target.name]: e.target.value });
  };

  const handleCardChange = (e) => {
    let value = e.target.value;
    if (e.target.name === 'card_number') {
      value = value.replace(/\D/g, '').replace(/(\d{4})/g, '$1 ').trim().slice(0, 19);
    }
    if (e.target.name === 'expiry') {
      value = value.replace(/\D/g, '');
      if (value.length >= 2) {
        value = value.slice(0, 2) + '/' + value.slice(2, 4);
      }
    }
    if (e.target.name === 'cvv') {
      value = value.replace(/\D/g, '').slice(0, 4);
    }
    setCardDetails({ ...cardDetails, [e.target.name]: value });
  };

  const getActiveShippingAddress = () => {
    if (selectedShippingAddressId) {
      const addr = savedAddresses.find((a) => a.id === selectedShippingAddressId);
      if (addr) {
        return {
          first_name: addr.first_name,
          last_name: addr.last_name,
          phone_number: addr.phone_number,
          address_line_1: addr.address_line_1,
          address_line_2: addr.address_line_2,
          city: addr.city,
          state: addr.state,
          postal_code: addr.postal_code,
          country: addr.country,
        };
      }
    }
    return shippingForm;
  };

  const getActiveBillingAddress = () => {
    if (billingSameAsShipping) return getActiveShippingAddress();
    if (selectedBillingAddressId) {
      const addr = savedAddresses.find((a) => a.id === selectedBillingAddressId);
      if (addr) {
        return {
          first_name: addr.first_name,
          last_name: addr.last_name,
          phone_number: addr.phone_number,
          address_line_1: addr.address_line_1,
          address_line_2: addr.address_line_2,
          city: addr.city,
          state: addr.state,
          postal_code: addr.postal_code,
          country: addr.country,
        };
      }
    }
    return billingForm;
  };

  const validateShipping = () => {
    if (!user?.email) {
      setError('Please log in to place an order');
      return false;
    }
    const addr = getActiveShippingAddress();
    if (!addr.first_name || !addr.last_name || !addr.address_line_1 || !addr.city || !addr.state || !addr.postal_code || !addr.country) {
      setError('Please fill in all required shipping address fields');
      return false;
    }
    if (!billingSameAsShipping) {
      const billing = getActiveBillingAddress();
      if (!billing.first_name || !billing.last_name || !billing.address_line_1 || !billing.city || !billing.state || !billing.postal_code || !billing.country) {
        setError('Please fill in all required billing address fields');
        return false;
      }
    }
    if (deliveryType === 'pickup' && !selectedPickupLocation) {
      setError('Please select a pickup location');
      return false;
    }
    return true;
  };

  const validatePayment = () => {
    if (paymentMethod === 'credit_card') {
      if (!cardDetails.card_number || !cardDetails.expiry || !cardDetails.cvv) {
        setError('Please fill in all card details');
        return false;
      }
      if (cardDetails.card_number.replace(/\s/g, '').length < 13) {
        setError('Invalid card number');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    setError(null);
    if (currentStep === 'shipping') {
      if (!validateShipping()) return;
      setCurrentStep('payment');
    } else if (currentStep === 'payment') {
      if (!validatePayment()) return;
      setCurrentStep('review');
    }
  };

  const handleBack = () => {
    setError(null);
    if (currentStep === 'payment') setCurrentStep('shipping');
    else if (currentStep === 'review') setCurrentStep('payment');
  };

  const handlePlaceOrder = async () => {
    if (!termsAgreed) {
      setError('You must agree to the terms and conditions');
      return;
    }

    setPlacing(true);
    setError(null);

    try {
      const shippingAddr = getActiveShippingAddress();
      const billingAddr = getActiveBillingAddress();

      const orderData = {
        email: user?.email || '',
        shipping_address: shippingAddr,
        billing_address: billingSameAsShipping ? null : billingAddr,
        billing_same_as_shipping: billingSameAsShipping,
        shipping_method: deliveryType === 'pickup' ? 'pickup' : (shippingMethod || 'standard'),
        payment_method: paymentMethod,
        payment_details:
          paymentMethod === 'credit_card'
            ? {
                // WARNING: Handling card details directly violates PCI-DSS compliance.
                // In production, use a payment processor (Stripe, Braintree, etc.) that
                // handles card data via tokenization. Never store raw card numbers.
                card_number: cardDetails.card_number.replace(/\s/g, ''),
                expiry: cardDetails.expiry,
                cvv: cardDetails.cvv,
                cardholder_name: cardDetails.cardholder_name,
              }
            : null,
        notes: notes || null,
        terms_agreed: true,
        coupon_code: cart.summary?.coupon_code || null,
        gift_card_code: cart.summary?.gift_card_code || null,
        delivery_type: deliveryType,
        pickup_location_id: deliveryType === 'pickup' ? selectedPickupLocation : null,
      };

      const response = await checkoutService.placeOrder(orderData);

      if (response.success) {
        navigate('/order-confirmation', {
          state: { order: response.data },
        });
      } else {
        setError('Failed to place order. Please try again.');
      }
    } catch (err) {
      const message = err.response?.data?.detail || 'Failed to place order. Please try again.';
      setError(message);
    } finally {
      setPlacing(false);
    }
  };

  const shippingAddresses = savedAddresses.filter((a) => a.address_type === 'shipping');
  const billingAddresses = savedAddresses.filter((a) => a.address_type === 'billing');

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="text-xl font-bold text-primary-600">
              E-Commerce
            </Link>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Lock className="w-4 h-4" />
              Secure Checkout
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate('/cart')}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Cart
        </button>

        <div className="flex items-center justify-center mb-8">
          {STEPS.map((step, index) => {
            const StepIcon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted =
              (step.id === 'shipping' && ['payment', 'review'].includes(currentStep)) ||
              (step.id === 'payment' && currentStep === 'review');

            return (
              <div key={step.id} className="flex items-center">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                      isCompleted
                        ? 'bg-green-500 text-white'
                        : isActive
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <StepIcon className="w-4 h-4" />
                    )}
                  </div>
                  <span
                    className={`text-sm font-medium hidden sm:block ${
                      isActive ? 'text-gray-900' : 'text-gray-500'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={`w-12 sm:w-20 h-0.5 mx-2 ${
                      isCompleted ? 'bg-green-500' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {currentStep === 'shipping' && (
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">
                  Shipping Information
                </h2>

                {isAuthenticated && shippingAddresses.length > 0 && (
                  <div className="mb-6">
                    <p className="text-sm font-medium text-gray-700 mb-3">
                      Select a saved address
                    </p>
                    <div className="space-y-2">
                      {shippingAddresses.map((addr) => (
                        <label
                          key={addr.id}
                          className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                            selectedShippingAddressId === addr.id
                              ? 'border-primary-500 bg-primary-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <input
                            type="radio"
                            name="shipping_address"
                            checked={selectedShippingAddressId === addr.id}
                            onChange={() => setSelectedShippingAddressId(addr.id)}
                            className="mt-1 w-4 h-4 text-primary-600"
                          />
                          <div className="text-sm">
                            <p className="font-medium text-gray-900">
                              {addr.label || `${addr.address_line_1}`}
                              {addr.is_default && (
                                <span className="ml-2 text-xs text-primary-600">(Default)</span>
                              )}
                            </p>
                            <p className="text-gray-500">
                              {addr.address_line_1}, {addr.city}, {addr.state} {addr.postal_code}
                            </p>
                          </div>
                        </label>
                      ))}
                    </div>
                    <button
                      onClick={() => setSelectedShippingAddressId(null)}
                      className="mt-3 text-sm text-primary-600 hover:text-primary-700"
                    >
                      + Use a new address
                    </button>
                  </div>
                )}

                {(!isAuthenticated || !selectedShippingAddressId) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="label">First Name *</label>
                      <input
                        type="text"
                        name="first_name"
                        value={shippingForm.first_name}
                        onChange={handleShippingChange}
                        className="input-field"
                        required
                      />
                    </div>
                    <div>
                      <label className="label">Last Name *</label>
                      <input
                        type="text"
                        name="last_name"
                        value={shippingForm.last_name}
                        onChange={handleShippingChange}
                        className="input-field"
                        required
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="label">Phone Number</label>
                      <input
                        type="tel"
                        name="phone_number"
                        value={shippingForm.phone_number}
                        onChange={handleShippingChange}
                        className="input-field"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="label">Address Line 1 *</label>
                      <input
                        type="text"
                        name="address_line_1"
                        value={shippingForm.address_line_1}
                        onChange={handleShippingChange}
                        className="input-field"
                        required
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="label">Address Line 2</label>
                      <input
                        type="text"
                        name="address_line_2"
                        value={shippingForm.address_line_2}
                        onChange={handleShippingChange}
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="label">City *</label>
                      <input
                        type="text"
                        name="city"
                        value={shippingForm.city}
                        onChange={handleShippingChange}
                        className="input-field"
                        required
                      />
                    </div>
                    <div>
                      <label className="label">State *</label>
                      <input
                        type="text"
                        name="state"
                        value={shippingForm.state}
                        onChange={handleShippingChange}
                        className="input-field"
                        required
                      />
                    </div>
                    <div>
                      <label className="label">Postal Code *</label>
                      <input
                        type="text"
                        name="postal_code"
                        value={shippingForm.postal_code}
                        onChange={handleShippingChange}
                        className="input-field"
                        required
                      />
                    </div>
                    <div>
                      <label className="label">Country *</label>
                      <input
                        type="text"
                        name="country"
                        value={shippingForm.country}
                        onChange={handleShippingChange}
                        className="input-field"
                        required
                      />
                    </div>
                  </div>
                )}

                <div className="mt-6 pt-6 border-t border-gray-100">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">
                    Delivery Method
                  </h3>
                  <div className="space-y-2 mb-4">
                    <label
                      className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                        deliveryType === 'shipping'
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="delivery_type"
                        checked={deliveryType === 'shipping'}
                        onChange={() => setDeliveryType('shipping')}
                        className="w-4 h-4 text-primary-600"
                      />
                      <Truck className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Ship to Address</p>
                        <p className="text-xs text-gray-500">Delivered to your door</p>
                      </div>
                    </label>
                    {pickupLocations.length > 0 && (
                      <label
                        className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                          deliveryType === 'pickup'
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="delivery_type"
                          checked={deliveryType === 'pickup'}
                          onChange={() => setDeliveryType('pickup')}
                          className="w-4 h-4 text-primary-600"
                        />
                        <MapPin className="w-5 h-5 text-gray-500" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Store Pickup</p>
                          <p className="text-xs text-gray-500">Free - Pick up from store</p>
                        </div>
                      </label>
                    )}
                  </div>

                  {deliveryType === 'shipping' && (
                    <div className="space-y-2">
                      {shippingMethods.map((method) => (
                        <label
                          key={method.id}
                          className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
                            shippingMethod === method.id
                              ? 'border-primary-500 bg-primary-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="radio"
                              name="shipping_method"
                              checked={shippingMethod === method.id}
                              onChange={() => setShippingMethod(method.id)}
                              className="w-4 h-4 text-primary-600"
                            />
                            <div>
                              <p className="text-sm font-medium text-gray-900">{method.name}</p>
                              <p className="text-xs text-gray-500">
                                {method.estimated_days_min}-{method.estimated_days_max} business days
                                {method.carrier && ` - ${method.carrier}`}
                              </p>
                            </div>
                          </div>
                          <span className="text-sm font-medium text-gray-900">
                            {method.free_shipping ? 'Free' : formatPrice(method.cost)}
                          </span>
                        </label>
                      ))}
                      {shippingMethods.length === 0 && (
                        <p className="text-sm text-gray-500 text-center py-4">
                          Enter your shipping address to see available methods
                        </p>
                      )}
                    </div>
                  )}

                  {deliveryType === 'pickup' && (
                    <div className="space-y-2">
                      {pickupLocations.map((location) => (
                        <label
                          key={location.id}
                          className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                            selectedPickupLocation === location.id
                              ? 'border-primary-500 bg-primary-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <input
                            type="radio"
                            name="pickup_location"
                            checked={selectedPickupLocation === location.id}
                            onChange={() => setSelectedPickupLocation(location.id)}
                            className="mt-1 w-4 h-4 text-primary-600"
                          />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{location.name}</p>
                            <p className="text-xs text-gray-500">
                              {location.address_line_1}, {location.city}, {location.state} {location.postal_code}
                            </p>
                            {location.working_hours && (
                              <p className="text-xs text-gray-500">{location.working_hours}</p>
                            )}
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-6 border-t border-gray-100">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={billingSameAsShipping}
                      onChange={(e) => setBillingSameAsShipping(e.target.checked)}
                      className="w-4 h-4 text-primary-600 rounded"
                    />
                    <span className="text-sm text-gray-700">
                      Billing address same as shipping
                    </span>
                  </label>
                </div>

                {!billingSameAsShipping && (
                  <div className="mt-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">
                      Billing Address
                    </h3>
                    {isAuthenticated && billingAddresses.length > 0 && (
                      <div className="mb-4">
                        <div className="space-y-2">
                          {billingAddresses.map((addr) => (
                            <label
                              key={addr.id}
                              className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                                selectedBillingAddressId === addr.id
                                  ? 'border-primary-500 bg-primary-50'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <input
                                type="radio"
                                name="billing_address"
                                checked={selectedBillingAddressId === addr.id}
                                onChange={() => setSelectedBillingAddressId(addr.id)}
                                className="mt-1 w-4 h-4 text-primary-600"
                              />
                              <div className="text-sm">
                                <p className="font-medium text-gray-900">
                                  {addr.label || addr.address_line_1}
                                </p>
                                <p className="text-gray-500">
                                  {addr.address_line_1}, {addr.city}, {addr.state} {addr.postal_code}
                                </p>
                              </div>
                            </label>
                          ))}
                        </div>
                        <button
                          onClick={() => setSelectedBillingAddressId(null)}
                          className="mt-3 text-sm text-primary-600 hover:text-primary-700"
                        >
                          + Use a new address
                        </button>
                      </div>
                    )}
                    {(!isAuthenticated || !selectedBillingAddressId) && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="label">First Name *</label>
                          <input
                            type="text"
                            name="first_name"
                            value={billingForm.first_name}
                            onChange={handleBillingChange}
                            className="input-field"
                          />
                        </div>
                        <div>
                          <label className="label">Last Name *</label>
                          <input
                            type="text"
                            name="last_name"
                            value={billingForm.last_name}
                            onChange={handleBillingChange}
                            className="input-field"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="label">Address Line 1 *</label>
                          <input
                            type="text"
                            name="address_line_1"
                            value={billingForm.address_line_1}
                            onChange={handleBillingChange}
                            className="input-field"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="label">Address Line 2</label>
                          <input
                            type="text"
                            name="address_line_2"
                            value={billingForm.address_line_2}
                            onChange={handleBillingChange}
                            className="input-field"
                          />
                        </div>
                        <div>
                          <label className="label">City *</label>
                          <input
                            type="text"
                            name="city"
                            value={billingForm.city}
                            onChange={handleBillingChange}
                            className="input-field"
                          />
                        </div>
                        <div>
                          <label className="label">State *</label>
                          <input
                            type="text"
                            name="state"
                            value={billingForm.state}
                            onChange={handleBillingChange}
                            className="input-field"
                          />
                        </div>
                        <div>
                          <label className="label">Postal Code *</label>
                          <input
                            type="text"
                            name="postal_code"
                            value={billingForm.postal_code}
                            onChange={handleBillingChange}
                            className="input-field"
                          />
                        </div>
                        <div>
                          <label className="label">Country *</label>
                          <input
                            type="text"
                            name="country"
                            value={billingForm.country}
                            onChange={handleBillingChange}
                            className="input-field"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-6 flex justify-end">
                  <button onClick={handleNext} className="btn-primary px-8">
                    Continue to Payment
                  </button>
                </div>
              </div>
            )}

            {currentStep === 'payment' && (
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">
                  Payment Method
                </h2>

                <div className="space-y-3 mb-6">
                  {[
                    { id: 'cod', name: 'Cash on Delivery', desc: 'Pay when you receive your order' },
                    { id: 'credit_card', name: 'Credit / Debit Card', desc: 'Visa, Mastercard, AMEX' },
                    { id: 'paypal', name: 'PayPal', desc: 'Pay with your PayPal account' },
                  ].map((method) => (
                    <label
                      key={method.id}
                      className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                        paymentMethod === method.id
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment_method"
                        checked={paymentMethod === method.id}
                        onChange={() => setPaymentMethod(method.id)}
                        className="w-4 h-4 text-primary-600"
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{method.name}</p>
                        <p className="text-xs text-gray-500">{method.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>

                {paymentMethod === 'credit_card' && (
                  <div className="p-4 bg-gray-50 rounded-lg space-y-4">
                    <div>
                      <label className="label">Cardholder Name</label>
                      <input
                        type="text"
                        name="cardholder_name"
                        value={cardDetails.cardholder_name}
                        onChange={handleCardChange}
                        className="input-field"
                        placeholder="John Smith"
                      />
                    </div>
                    <div>
                      <label className="label">Card Number</label>
                      <input
                        type="text"
                        name="card_number"
                        value={cardDetails.card_number}
                        onChange={handleCardChange}
                        className="input-field"
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="label">Expiry Date</label>
                        <input
                          type="text"
                          name="expiry"
                          value={cardDetails.expiry}
                          onChange={handleCardChange}
                          className="input-field"
                          placeholder="MM/YY"
                          maxLength={5}
                        />
                      </div>
                      <div>
                        <label className="label">CVV</label>
                        <input
                          type="text"
                          name="cvv"
                          value={cardDetails.cvv}
                          onChange={handleCardChange}
                          className="input-field"
                          placeholder="123"
                          maxLength={4}
                        />
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      This is a simulated payment. No real charges will be made.
                    </p>
                  </div>
                )}

                {paymentMethod === 'paypal' && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-700">
                      You will be redirected to PayPal to complete your payment after reviewing your order.
                    </p>
                  </div>
                )}

                <div className="mt-6">
                  <label className="label">Order Notes (Optional)</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="input-field"
                    rows={3}
                    placeholder="Any special instructions for your order..."
                    maxLength={500}
                  />
                </div>

                <div className="mt-6 flex justify-between">
                  <button onClick={handleBack} className="btn-secondary px-6">
                    Back
                  </button>
                  <button onClick={handleNext} className="btn-primary px-8">
                    Review Order
                  </button>
                </div>
              </div>
            )}

            {currentStep === 'review' && (
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">
                  Review Your Order
                </h2>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">
                      Shipping Address
                    </h3>
                    <div className="p-3 bg-gray-50 rounded-lg text-sm">
                      <p className="font-medium">
                        {getActiveShippingAddress().first_name}{' '}
                        {getActiveShippingAddress().last_name}
                      </p>
                      <p className="text-gray-600">
                        {getActiveShippingAddress().address_line_1}
                        {getActiveShippingAddress().address_line_2 &&
                          `, ${getActiveShippingAddress().address_line_2}`}
                      </p>
                      <p className="text-gray-600">
                        {getActiveShippingAddress().city},{' '}
                        {getActiveShippingAddress().state}{' '}
                        {getActiveShippingAddress().postal_code}
                      </p>
                      <p className="text-gray-600">
                        {getActiveShippingAddress().country}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">
                      Billing Address
                    </h3>
                    <div className="p-3 bg-gray-50 rounded-lg text-sm">
                      <p className="font-medium">
                        {getActiveBillingAddress().first_name}{' '}
                        {getActiveBillingAddress().last_name}
                      </p>
                      <p className="text-gray-600">
                        {getActiveBillingAddress().address_line_1}
                        {getActiveBillingAddress().address_line_2 &&
                          `, ${getActiveBillingAddress().address_line_2}`}
                      </p>
                      <p className="text-gray-600">
                        {getActiveBillingAddress().city},{' '}
                        {getActiveBillingAddress().state}{' '}
                        {getActiveBillingAddress().postal_code}
                      </p>
                      <p className="text-gray-600">
                        {getActiveBillingAddress().country}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-2">
                        Delivery Method
                      </h3>
                      <div className="p-3 bg-gray-50 rounded-lg text-sm">
                        {deliveryType === 'pickup' ? (
                          <>
                            <p className="font-medium">Store Pickup</p>
                            <p className="text-gray-500">
                              {pickupLocations.find(l => l.id === selectedPickupLocation)?.name || 'Selected location'}
                            </p>
                          </>
                        ) : (
                          <>
                            <p className="font-medium">
                              {shippingMethods.find(m => m.id === shippingMethod)?.name || shippingMethod}
                            </p>
                            <p className="text-gray-500">
                              {shippingMethods.find(m => m.id === shippingMethod)
                                ? `${shippingMethods.find(m => m.id === shippingMethod).estimated_days_min}-${shippingMethods.find(m => m.id === shippingMethod).estimated_days_max} business days`
                                : 'Estimated delivery'}
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-2">
                        Payment Method
                      </h3>
                      <div className="p-3 bg-gray-50 rounded-lg text-sm">
                        <p className="font-medium">
                          {paymentMethod === 'cod' && 'Cash on Delivery'}
                          {paymentMethod === 'credit_card' &&
                            `Card ending in ${cardDetails.card_number.slice(-4)}`}
                          {paymentMethod === 'paypal' && 'PayPal'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-3">
                      Order Items
                    </h3>
                    <div className="space-y-3">
                      {cart.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex gap-3 p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="w-14 h-14 flex-shrink-0 bg-gray-200 rounded-lg overflow-hidden">
                            <img
                              src={item.product_image || 'https://placehold.co/60x60/e2e8f0/94a3b8?text=No+Image'}
                              alt={item.product_name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {item.product_name}
                            </p>
                            <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                          </div>
                          <p className="text-sm font-medium text-gray-900">
                            {formatPrice(item.product_price * item.quantity)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {notes && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-2">
                        Order Notes
                      </h3>
                      <p className="p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
                        {notes}
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-6 border-t border-gray-100">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={termsAgreed}
                      onChange={(e) => setTermsAgreed(e.target.checked)}
                      className="mt-1 w-4 h-4 text-primary-600 rounded"
                    />
                    <span className="text-sm text-gray-600">
                      I agree to the{' '}
                      <Link to="#" className="text-primary-600 hover:underline">
                        Terms and Conditions
                      </Link>{' '}
                      and{' '}
                      <Link to="#" className="text-primary-600 hover:underline">
                        Privacy Policy
                      </Link>
                      . I understand that this is a simulated checkout and no real payment
                      will be processed.
                    </span>
                  </label>
                </div>

                <div className="mt-6 flex justify-between">
                  <button onClick={handleBack} className="btn-secondary px-6">
                    Back
                  </button>
                  <button
                    onClick={handlePlaceOrder}
                    disabled={!termsAgreed || placing}
                    className="btn-primary px-8 flex items-center gap-2"
                  >
                    {placing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Placing Order...
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        Place Order
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-100 p-6 sticky top-24">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Order Summary
              </h3>

              <div className="max-h-48 overflow-y-auto mb-4">
                {cart.items.map((item) => (
                  <div key={item.id} className="flex gap-3 py-2">
                    <div className="w-12 h-12 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={item.product_image || 'https://placehold.co/50x50/e2e8f0/94a3b8?text=No+Image'}
                        alt={item.product_name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-900 truncate">
                        {item.product_name}
                      </p>
                      <p className="text-xs text-gray-500">x{item.quantity}</p>
                    </div>
                    <p className="text-xs font-medium text-gray-900">
                      {formatPrice(item.product_price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="space-y-2 pt-4 border-t border-gray-100">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">{formatPrice(cart.summary?.subtotal || 0)}</span>
                </div>
                {cart.summary?.discount_amount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600">Discount</span>
                    <span className="font-medium text-green-600">
                      -{formatPrice(cart.summary.discount_amount)}
                    </span>
                  </div>
                )}
                {cart.summary?.gift_card_amount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-purple-600">Gift Card</span>
                    <span className="font-medium text-purple-600">
                      -{formatPrice(cart.summary.gift_card_amount)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">
                    {cart.summary?.estimated_shipping === 0
                      ? 'Free'
                      : formatPrice(cart.summary?.estimated_shipping || 0)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium">
                    {formatPrice(cart.summary?.estimated_tax || 0)}
                  </span>
                </div>
                <div className="flex justify-between text-base font-bold pt-2 border-t border-gray-100">
                  <span>Total</span>
                  <span>{formatPrice(cart.summary?.total || 0)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
