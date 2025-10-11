import { configureStore } from "@reduxjs/toolkit";

//Delivery
import authReducer from "../features/delivery/auth/authSlice";
import notificationsDeliveryReducer from "../features/delivery/notification/notificationSlice";
import deliveryThemeReducer from "../features/delivery/delivery/deliveryThemeSlice";

//Customer
import customerAuthReducer from "../features/customer/auth/CustomerAuthSlice";
import productsReducer from "../features/customer/customer/productsSlice";
import cartReducer from "../features/customer/customer/cartSlice";
import ordersReducer from "../features/customer/customer/ordersSlice";
import profileReducer from "../features/customer/customer/profileSlice"; 
import categoriesReducer from "../features/customer/customer/categoriesSlice";
import storesReducer from "../features/customer/customer/storesSlice";
import reviewsReducer from "../features/customer/review/reviewSlice";
import paymentReducer from "../features/customer/customer/paymentSlice";
import chatReducer from "../features/customer/customer/chatSlice";

//admin slice
import vendorsReducer from "../features/admin/vendor/vendorSlice";
import deliveriesReducer from "../features/admin/delivery/deliverySlice";
import orderReducer from "../features/admin/orders/orderSlice";
import cmsReducer from "../features/admin/CMS/cmsSlice";
import notificationsReducer from "../features/admin/CMS/notification/notificationSlice";
import categoryReducer from "../features/admin/CMS/categories/categorySlice";
import themeReducer from "../features/admin/dark-lightMode/themeSlice";

const store = configureStore({
  reducer: {
    //Customer
    customerAuth: customerAuthReducer,
    products: productsReducer,
    cart: cartReducer,
    orders: ordersReducer,
    profile: profileReducer,
    categories: categoriesReducer,
    stores: storesReducer,
    reviews: reviewsReducer,
    payment: paymentReducer,
    chat: chatReducer,
    //Admin
    vendors: vendorsReducer,
    deliveries: deliveriesReducer,
    ordersAdmin: orderReducer,
    cms: cmsReducer,
    notifications: notificationsReducer,
    categoriesAdmin: categoryReducer,
    theme: themeReducer,
    //Delivery
    auth: authReducer,
    notificationsDelivery: notificationsDeliveryReducer,
    deliveryTheme: deliveryThemeReducer,
  },
});

export default store;


