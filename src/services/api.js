import axios from 'axios';
import { getToken } from '../utils/storage'; 

// ✅ CORRECT LIVE URL (Based on your screenshot)
const BASE_URL = 'https://store.swiftpos.ng/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  async (config) => {
    const token = await getToken('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// --- API FUNCTIONS ---
export const loginUser = async (username, password) => {
    // Note: Django requires a trailing slash "/"
    const response = await api.post('/token/', { username, password });
    return response.data;
};

export const registerUser = async (userData) => {
    const response = await api.post('/register/', userData);
    return response.data;
};
// ============================================================
// 3. PRODUCT ENDPOINTS
// ============================================================
export const fetchCategories = async () => {
  const response = await api.get('/categories/');
  return response.data;
};

export const fetchProducts = async (categoryId = null) => {
  const url = categoryId ? `/products/?category=${categoryId}` : '/products/';
  const response = await api.get(url);
  return response.data;
};

export const searchProducts = async (query) => {
  const response = await api.get(`/products/?search=${query}`);
  return response.data;
};

export const fetchProductDetails = async (id) => {
  const response = await api.get(`/products/${id}/`);
  return response.data;
};

// ============================================================
// 4. CART ENDPOINTS
// ============================================================
export const fetchCart = async () => {
  const response = await api.get('/cart/');
  return response.data; 
  // Expects: { items: [], total_price: 0, total_items: 0 }
};

export const addToCart = async (productId, quantity = 1) => {
  const response = await api.post('/cart/add/', { product_id: productId, quantity });
  return response.data;
};

export const updateCartItem = async (itemId, quantity) => {
  const response = await api.put(`/cart/items/${itemId}/`, { quantity });
  return response.data;
};

export const removeCartItem = async (itemId) => {
  const response = await api.delete(`/cart/items/${itemId}/`);
  return response.data;
};
// ... existing imports

// 1. Get Delivery Fee based on State
export const getDeliveryFee = async (stateName) => {
  // Example: /shipping/calculate/?state=Kano
  const response = await api.get(`/shipping/calculate/?state=${stateName}`);
  return response.data; // Expecting { fee: 1500 }
};

// 2. Place Order
export const placeOrder = async (orderData) => {
  // orderData = { address, city, state, phone, payment_method, payment_reference, delivery_fee }
  const response = await api.post('/orders/', orderData);
  return response.data;
};


export const fetchOrders = async () => {
  const response = await api.get('/orders/');
  return response.data;
};

export const fetchOrderDetails = async (orderId) => {
  const response = await api.get(`/orders/${orderId}/`);
  return response.data;
};

// 2. Profile Management
export const updateProfile = async (userData) => {
  const response = await api.patch('/auth/user/', userData);
  return response.data;
};

// 3. Submit Review
export const submitReview = async (productId, rating, comment) => {
  const response = await api.post(`/products/${productId}/reviews/`, { rating, comment });
  return response.data;
};

export default api;