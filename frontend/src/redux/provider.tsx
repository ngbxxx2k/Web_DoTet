"use client";

import { store, persistor } from "./store";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import React, { useEffect } from "react";
import { initializeWishlist } from "./features/wishlist-slice";

function WishlistInitializer({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    store.dispatch(initializeWishlist());
  }, []);
  
  return <>{children}</>;
}

export function ReduxProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <WishlistInitializer>{children}</WishlistInitializer>
      </PersistGate>
    </Provider>
  );
}
