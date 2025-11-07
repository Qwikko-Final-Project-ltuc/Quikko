// services/deliveryService.js
const API_BASE_URL ='http://localhost:3000/api';

export const getRequestedOrders = async () => {
  try {
    const token = localStorage.getItem('token');
    console.log('🔑 Making API request with token:', token ? 'Exists' : 'Missing');
    
    const response = await fetch(`${API_BASE_URL}/customers/delivery/requested-orders`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('📡 API Response status:', response.status);
    console.log('📡 API Response ok:', response.ok);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error response:', errorText);
      throw new Error(`Failed to fetch requested orders: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ API Success response:', data);
    console.log('📦 API Data received - success:', data.success);
    console.log('📦 API Data received - orders count:', data.data ? data.data.length : 0);
    
    return data.data || [];
  } catch (error) {
    console.error('❌ Network error in getRequestedOrders:', error);
    throw error;
  }
};

// في services/deliveryService.js
export const acceptOrder = async (orderId) => {
  try {
    const token = localStorage.getItem('token');
    console.log('✅ Sending accept request for order:', orderId);
    
    // استخدم المسار الصحيح بناءً على الـ backend
    const response = await fetch(`${API_BASE_URL}/customers/${orderId}/accept`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('📡 Accept order response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Accept order error response:', errorText);
      throw new Error(`Failed to accept order: ${response.status}`);
    }

    const result = await response.json();
    console.log('✅ Accept order success:', result);
    return result;
  } catch (error) {
    console.error('❌ Accept order error:', error);
    throw error;
  }
};
export const getAcceptedOrders = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/customers/delivery/accepted-orders`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) throw new Error('Failed to fetch accepted orders');
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error in getAcceptedOrders:', error);
    throw error;
  }
};

export const updateOrderStatus = async (orderId, status) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`/api/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status })
    });
    
    if (!response.ok) throw new Error('Failed to update order status');
    return await response.json();
  } catch (error) {
    console.error('Error in updateOrderStatus:', error);
    throw error;
  }
};