"use client";
import { useEffect } from "react";
import { useAppDispatch } from "@/redux/store";
import { fetchSettings } from "@/redux/features/settings-slice";

export default function SettingsInitializer() {
  const dispatch = useAppDispatch();
  
  useEffect(() => {
    // Fetch settings on app initialization
    dispatch(fetchSettings());
  }, [dispatch]);
  
  return null;
}
