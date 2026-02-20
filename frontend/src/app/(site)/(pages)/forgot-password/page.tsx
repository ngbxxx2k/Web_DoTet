
import ForgotPassword from "@/components/Auth/ForgotPassword";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forgot Password | NextCommerce Next.js E-commerce Template",
  description: "This is Forgot Password page for NextCommerce Next.js E-commerce template",
  // other metadata
};

const ForgotPasswordPage = () => {
  return (
    <>
      <ForgotPassword />
    </>
  );
};

export default ForgotPasswordPage;
