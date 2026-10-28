const BASE = "/api";

export const getToken = () => localStorage.getItem("token");
export const setToken = (token) => localStorage.setItem("token", token);
export const clearToken = () => localStorage.removeItem("token");

const FALLBACK_IMG =
  "https://placehold.co/600x400/f3f4f6/9ca3af?text=QuickBite";

async function request(path, options = {}) {
  const token = getToken();

  const response = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
}

export const mapRestaurant = (r) => ({
  ...r,
  id: r._id || r.id,
  _id: r._id || r.id,
  name: r.name,
  description: r.description || "",
  image: r.image || FALLBACK_IMG,
  cuisine: r.cuisine || r.cuisines || [],
  cuisines: r.cuisines || r.cuisine || [],
  address: r.address || "",
  rating: r.rating ?? 4.5,
  deliveryTime: r.deliveryTime || "30–40 min",
  deliveryFee: r.deliveryFee ?? 0,
  offer: r.offer || "",
  priceForTwo: r.priceForTwo ?? 400,
  isOpen: r.isOpen ?? true,
  isPromoted: r.isPromoted ?? false,
});

export const mapFood = (food) => ({
  ...food,
  id: food._id || food.id,
  _id: food._id || food.id,
  name: food.name,
  description: food.description || "",
  image: food.image || FALLBACK_IMG,
  price: food.price,
  category: food.category || "Popular",
  restaurant:
    typeof food.restaurant === "object"
      ? food.restaurant?.name
      : undefined,
  restaurantId:
    typeof food.restaurant === "object"
      ? food.restaurant?._id
      : food.restaurant || food.restaurantId,
  isAvailable: food.isAvailable ?? true,
});

export const getRestaurants = async () => {
  const data = await request("/restaurants");
  return (data.restaurants || []).map(mapRestaurant);
};

export const getRestaurant = async (id) => {
  const data = await request(`/restaurants/${id}`);
  return mapRestaurant(data.restaurant || data);
};

export const getFoods = async (restaurantId) => {
  const path = restaurantId
    ? `/foods?restaurant=${encodeURIComponent(restaurantId)}`
    : "/foods";

  const data = await request(path);
  return (data.foods || []).map(mapFood);
};

export const login = (body) =>
  request("/auth/login", {
    method: "POST",
    body: JSON.stringify(body),
  });

export const register = (body) =>
  request("/auth/register", {
    method: "POST",
    body: JSON.stringify(body),
  });

export const getCart = () => request("/cart");

export const addToCart = (body) =>
  request("/cart/add", {
    method: "POST",
    body: JSON.stringify(body),
  });

export const updateCartItem = (foodId, quantity) =>
  request(`/cart/item/${encodeURIComponent(foodId)}`, {
    method: "PUT",
    body: JSON.stringify({ quantity }),
  });

export const removeCartItem = (foodId) =>
  request(`/cart/item/${encodeURIComponent(foodId)}`, {
    method: "DELETE",
  });

export const clearCart = () =>
  request("/cart/clear", {
    method: "DELETE",
  });


export const getAddresses = () => request("/addresses");

export const addAddress = (body) =>
  request("/addresses", {
    method: "POST",
    body: JSON.stringify(body),
  });

export const updateAddress = (id, body) =>
  request(`/addresses/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });

export const deleteAddress = (id) =>
  request(`/addresses/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });

export const setDefaultAddress = (id) =>
  request(`/addresses/${encodeURIComponent(id)}/default`, {
    method: "PATCH",
  });


 export const getMyProfile = () => request("/users/me");
 export const updateMyProfile=(body)=>
  request("/users/me",{method:"PUT", body: JSON.stringify(body),});
 export const changeMyPassword = (body) =>
  request("/users/me/password", {
    method: "PATCH",
    body: JSON.stringify(body),
  });
export const placeOrder = (body) =>
  request("/orders", {
    method: "POST",
    body: JSON.stringify(body),
  });
  export const updateRestaurant = async (id, body) =>
  request(`/restaurants/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });

  export const createFood= async(body)=> request("/foods",{method:"POST", body:JSON.stringify(body),

  });
  export const updateFood= async(id,body)=> request(`/foods/${id}`,{method:"PUT", body:JSON.stringify(body),

  });
  export const deleteFood= async(id)=> request(`/foods/${id}`,{method:"DELETE",

  });


export const getMyOrders = () => request("/orders/my");

export const cancelOrderApi = (id) =>
  request(`/orders/${encodeURIComponent(id)}/cancel`, {
    method: "PATCH",
  });

export const getAdminOrders = ({
  status,
  page = 1,
  limit = 100,
  search,
} = {}) => {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("limit", String(limit));

  if (status) params.set("status", status);
  if (search) params.set("search", search);

  return request(`/orders/admin/manage?${params.toString()}`);
};

export const getAdminOrder = (id) =>
  request(`/orders/admin/${encodeURIComponent(id)}`);
export const getAdminDashboardOverview = () =>
  request("/admin/dashboard/overview");

export const updateOrderStatus = (id, status) =>
  request(`/orders/${encodeURIComponent(id)}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
  
export const updateDeliveryPartner = (id, { name, phone }) =>
  request(`/orders/${encodeURIComponent(id)}/delivery-partner`, {
    method: "PATCH",
    body: JSON.stringify({ name, phone }),
  });
export async function createPayment(orderId, method) {
  const response = await fetch(`${BASE}/payments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ orderId, method }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to create payment.");
  }

  return data;
}

export async function confirmDummyUpi(paymentId) {
  const response = await fetch(
    `${BASE}/payments/${paymentId}/dummy-confirm`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to confirm demo UPI payment.");
  }

  return data;
}

export async function getPaymentByOrder(orderId) {
  const response = await fetch(
    `${BASE}/payments/order/${orderId}`,
    {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to fetch payment.");
  }

  return data;
}

export async function getNotifications() {
  const response = await fetch(`${BASE}/notifications`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to fetch notifications.");
  }

  return data;
}

export async function markNotificationRead(notificationId) {
  const response = await fetch(
    `${BASE}/notifications/${notificationId}/read`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to mark notification as read.");
  }

  return data;
}

export async function markAllNotificationsRead() {
  const response = await fetch(`${BASE}/notifications/read-all`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to mark all notifications as read.");
  }

  return data;
}

export async function deleteNotification(notificationId) {
  const response = await fetch(
    `${BASE}/notifications/${notificationId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to delete notification.");
  }

  return data;
}

export const getCoupons = () =>
  request("/coupons");

export const createCoupon = (couponData) =>
  request("/coupons", {
    method: "POST",
    body: JSON.stringify(couponData),
  });

export const deleteCoupon = (couponId) =>
  request(`/coupons/${couponId}`, {
    method: "DELETE",
  });
export const validateCoupon = (code, orderAmount) =>
  request("/coupons/validate", {
    method: "POST",
    body: JSON.stringify({ code, orderAmount }),
  });

  export const firebaseLogin= async(idToken, name)=>{
    const data= await request("/auth/firebase",{
      method:"POST",
      body:JSON.stringify({idToken, name}),
    });
    if(!data.token){
      throw new Error("firebase login response dont have quickbite token");
    }
    setToken(data.token);
    return data;
  };

  
    export const getRestaurantReviews = (restaurantId) =>
  request(`/reviews/restaurant/${encodeURIComponent(restaurantId)}`);
  export const createReview = ({ restaurant, rating, comment }) =>
  request("/reviews", {
    method: "POST",
    body: JSON.stringify({ restaurant, rating, comment }),
  });
  export const deleteMyReview = (reviewId) =>
  request(`/reviews/${encodeURIComponent(reviewId)}`, {
    method: "DELETE",
  });
  
/* Inventory API — Admin only */

export const getInventory = ({ page = 1, limit = 10 } = {}) => {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  return request(`/inventory?${params.toString()}`);
};

export const getLowStockItems = () =>
  request("/inventory/low-stock");

export const getInventoryByFood = (foodId) =>
  request(`/inventory/food/${encodeURIComponent(foodId)}`);

export const restockInventory = (foodId, quantity) =>
  request("/inventory/restock", {
    method: "POST",
    body: JSON.stringify({ foodId, quantity }),
  });

export const updateInventoryQuantity = (foodId, quantity) =>
  request(`/inventory/food/${encodeURIComponent(foodId)}`, {
    method: "PATCH",
    body: JSON.stringify({ quantity }),
  });
export const assignDelivery = ({
  orderId,
  deliveryPartnerId,
  pickupAddress,
  estimatedDeliveryAt,
}) =>
  request("/deliveries/assign", {
    method: "POST",
    body: JSON.stringify({
      orderId,
      deliveryPartnerId,
      pickupAddress,
      estimatedDeliveryAt,
    }),
  });

export const getAllDeliveries = ({
  page = 1,
  limit = 10,
  status,
} = {}) => {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  if (status) {
    params.set("status", status);
  }

  return request(`/deliveries/all?${params.toString()}`);
};

export const getDeliveryByOrder = (orderId) =>
  request(`/deliveries/order/${encodeURIComponent(orderId)}`);

export const updateDeliveryStatus = (
  deliveryId,
  status,
  failureReason
) =>
  request(`/deliveries/${encodeURIComponent(deliveryId)}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status, failureReason }),
  });

export const updateDeliveryLocation = (
  deliveryId,
  latitude,
  longitude
) =>
  request(`/deliveries/${encodeURIComponent(deliveryId)}/location`, {
    method: "PATCH",
    body: JSON.stringify({ latitude, longitude }),
  });
  export const getDeliveryPartners=()=>
    request("/users/delivery-partners");