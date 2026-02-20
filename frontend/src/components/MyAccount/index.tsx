"use client";
import React, { useState, useEffect, useRef } from "react";
import Breadcrumb from "../Common/Breadcrumb";
import Image from "next/image";
import AddressModal from "./AddressModal";
import Orders from "../Orders";
import { useAppSelector, useAppDispatch } from "@/redux/store";
import { logout, updateUser } from "@/redux/features/auth-slice";
import { useRouter } from "next/navigation";
import { UserService } from "@/services/user.service";
import toast from "react-hot-toast";
import Link from "next/link";
import ConfirmModal from "../ui/ConfirmModal";
import { Eye, EyeOff } from "lucide-react";

const MyAccount = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [addressModal, setAddressModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [showPassword, setShowPassword] = useState({
    old: false,
    new: false,
    confirm: false,
  });
  const [showPasswordConfirmModal, setShowPasswordConfirmModal] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [formError, setFormError] = useState({
    show: false,
    title: "",
    message: ""
  });

  const { user, token, isAuthenticated } = useAppSelector((state) => state.authReducer);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/signin");
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    // Optionally refresh profile on mount
    const fetchProfile = async () => {
       if (token) {
           try {
               const profile = await UserService.getProfile(token);
               dispatch(updateUser(profile));
           } catch {
               // ignore or handle token expiry
           }
       }
    }
    fetchProfile();
  }, [token, dispatch]);


  const [showAvatarConfirm, setShowAvatarConfirm] = useState(false);

  // ... (existing code)

  const openAddressModal = () => {
    setAddressModal(true);
  };

  const closeAddressModal = () => {
    setAddressModal(false);
  };

  const handleLogout = () => {
    dispatch(logout());
    toast.success("Đăng xuất thành công");
    router.push("/");
  };

  const handleAvatarClick = () => {
    setShowAvatarConfirm(true);
  };

  const handleConfirmAvatarChange = () => {
    setShowAvatarConfirm(false);
    setTimeout(() => {
        fileInputRef.current?.click();
    }, 100);
  };

  const onAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;

    const loadingToast = toast.loading("Đang tải ảnh lên...");
    try {
      const avatarUrl = await UserService.uploadAvatar(file, token);
      dispatch(updateUser({ avatarUrl }));
      toast.success("Cập nhật ảnh đại diện thành công", { id: loadingToast });
    } catch (error: any) {
      toast.error(error.message || "Lỗi khi tải ảnh", { id: loadingToast });
    }
  };

  const togglePasswordVisibility = (field: "old" | "new" ) => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
  };

  const handlePreSubmitPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
      setFormError({
        show: true,
        title: "Lỗi mật khẩu",
        message: "Mật khẩu xác nhận không khớp"
      });
      return;
    }
    if (passwordForm.oldPassword === passwordForm.newPassword) {
      setFormError({
        show: true,
        title: "Lỗi mật khẩu",
        message: "Mật khẩu mới không được trùng với mật khẩu cũ"
      });
      return;
    }
    if (!token) return;
    setShowPasswordConfirmModal(true);
  };

  const handleConfirmPasswordChange = async () => {
    setShowPasswordConfirmModal(false);
    if (!token) return;

    try {
      setLoadingPassword(true);
      await UserService.changePassword(
        passwordForm.oldPassword,
        passwordForm.newPassword,
        token
      );
      toast.success("Đổi mật khẩu thành công");
      setPasswordForm({ oldPassword: "", newPassword: "", confirmNewPassword: "" });
    } catch (error: any) {
      setFormError({
        show: true,
        title: "Lỗi đổi mật khẩu",
        message: error.message || "Đổi mật khẩu thất bại"
      });
    } finally {
      setLoadingPassword(false);
    }
  };

  if (!user) {
      return null; // Or loading spinner, but usually handled by redirect
  }

  // Helper to format address
  const formattedAddress = user.address
    ? `${user.address.addressDetail || ""}, ${user.address.ward || ""}, ${user.address.district || ""}, ${user.address.province || ""}`.replace(/^, |, $/g, "").replace(/, ,/g, ",")
    : "Chưa có địa chỉ";

  return (
    <>
      <Breadcrumb title={"Tài Khoản Của Tôi"} pages={["tài khoản"]} />

      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="flex flex-col xl:flex-row gap-7.5">
            {/* <!--== user dashboard menu start ==--> */}
            <div className="xl:max-w-[370px] w-full bg-white rounded-xl shadow-1">
              <div className="flex xl:flex-col">
                <div className="hidden lg:flex flex-wrap items-center gap-5 py-6 px-4 sm:px-7.5 xl:px-9 border-r xl:border-r-0 xl:border-b border-gray-3">
                  <div 
                    className="relative max-w-[64px] w-full h-16 rounded-full overflow-hidden cursor-pointer group"
                    onClick={handleAvatarClick}
                    title="Click to change avatar"
                  >
                    <Image
                      src={user.avatarUrl || "/images/users/user-04.jpg"} // Fallback image
                      alt="user"
                      width={64}
                      height={64}
                      className="object-cover h-full w-full"
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-white text-xs">Edit</span>
                    </div>
                  </div>
                  <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept="image/*"
                      onChange={onAvatarFileChange}
                  />

                  <div>
                    <p className="font-medium text-dark mb-0.5">
                      {user.fullName || "User"}
                    </p>
                    <p className="text-custom-xs text-gray-500">{user.email}</p>
                  </div>
                </div>

                <div className="p-4 sm:p-7.5 xl:p-9">
                  <div className="flex flex-wrap xl:flex-nowrap xl:flex-col gap-4">
                    
                    

                    <button
                      onClick={() => setActiveTab("orders")}
                      className={`flex items-center rounded-md gap-2.5 py-3 px-4.5 ease-out duration-200 hover:bg-blue hover:text-white ${
                        activeTab === "orders"
                          ? "text-white bg-blue"
                          : "text-dark-2 bg-gray-1"
                      }`}
                    >
                      Đơn Hàng
                    </button>

                    <button
                      onClick={() => setActiveTab("addresses")}
                      className={`flex items-center rounded-md gap-2.5 py-3 px-4.5 ease-out duration-200 hover:bg-blue hover:text-white ${
                        activeTab === "addresses"
                          ? "text-white bg-blue"
                          : "text-dark-2 bg-gray-1"
                      }`}
                    >
                      Địa Chỉ
                    </button>

                    <button
                      onClick={() => setActiveTab("account-details")}
                      className={`flex items-center rounded-md gap-2.5 py-3 px-4.5 ease-out duration-200 hover:bg-blue hover:text-white ${
                        activeTab === "account-details"
                          ? "text-white bg-blue"
                          : "text-dark-2 bg-gray-1"
                      }`}
                    >
                      Đổi Mật Khẩu
                    </button>

                    <button
                      onClick={handleLogout}
                      className={`flex items-center rounded-md gap-2.5 py-3 px-4.5 ease-out duration-200 hover:bg-blue hover:text-white text-dark-2 bg-gray-1`}
                    >
                      Đăng Xuất
                    </button>
                  </div>
                </div>
              </div>
            </div>
            {/* <!--== user dashboard menu end ==--> */}

            {/* <!-- dashboard tab content start --> */}

            <div
              className={`xl:max-w-[770px] w-full bg-white rounded-xl shadow-1 py-9.5 px-4 sm:px-7.5 xl:px-10 ${
                activeTab === "dashboard" ? "block" : "hidden"
              }`}
            >
              <p className="text-dark">
                Xin chào <strong>{user.fullName}</strong> (không phải {user.fullName}?{" "}
                <button
                  onClick={handleLogout}
                  className="text-red ease-out duration-200 hover:underline"
                >
                  Đăng Xuất
                </button>
                )
              </p>

              <p className="text-custom-sm mt-4">
                Từ bảng điều khiển tài khoản, bạn có thể xem các đơn hàng gần đây,
                quản lý địa chỉ giao hàng và thanh toán, cũng như chỉnh sửa
                mật khẩu và thông tin tài khoản.
              </p>
            </div>
            {/* <!-- dashboard tab content end -->

          <!-- orders tab content start --> */}
            <div
              className={`xl:max-w-[770px] w-full bg-white rounded-xl shadow-1 ${
                activeTab === "orders" ? "block" : "hidden"
              }`}
            >
              <Orders />
            </div>
            {/* <!-- orders tab content end -->


          <!-- addresses tab content start --> */}
            <div
              className={`flex-col sm:flex-row gap-7.5 ${
                activeTab === "addresses" ? "flex" : "hidden"
              }`}
            >
              <div className="w-full bg-white shadow-1 rounded-xl">
                <div className="flex items-center justify-between py-5 px-4 sm:pl-7.5 sm:pr-6 border-b border-gray-3">
                  <p className="font-medium text-xl text-dark">
                    Địa Chỉ Của Tôi
                  </p>

                  <button
                    className="text-blue ease-out duration-200 hover:text-blue-dark flex items-center gap-1"
                    onClick={openAddressModal}
                  >
                    <svg
                      className="fill-current"
                      width="18"
                      height="18"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                    Sửa
                  </button>
                </div>

                <div className="p-4 sm:p-7.5">
                  <div className="flex flex-col gap-4">
                    <p className="flex items-center gap-2.5 text-custom-sm">
                      <span className="font-semibold w-20">Tên:</span> {user.fullName}
                    </p>

                    <p className="flex items-center gap-2.5 text-custom-sm">
                       <span className="font-semibold w-20">Email:</span> {user.email}
                    </p>

                    <p className="flex items-center gap-2.5 text-custom-sm">
                       <span className="font-semibold w-20">SĐT:</span> {user.phoneNumber || "N/A"}
                    </p>

                    <p className="flex gap-2.5 text-custom-sm">
                       <span className="font-semibold w-20 flex-shrink-0">Địa chỉ:</span> 
                       <span>{formattedAddress}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
            {/* <!-- addresses tab content end -->

          <!-- details tab content start --> */}
            <div
              className={`xl:max-w-[770px] w-full ${
                activeTab === "account-details" ? "block" : "hidden"
              }`}
            >
              <form onSubmit={handlePreSubmitPassword}>
                <p className="font-medium text-xl sm:text-2xl text-dark mb-7">
                  Đổi Mật Khẩu
                </p>

                <div className="bg-white shadow-1 rounded-xl p-4 sm:p-8.5">
                  <div className="mb-5 relative">
                    <label htmlFor="oldPassword" className="block mb-2.5">
                      Mật khẩu cũ
                    </label>

                    <input
                      type={showPassword.old ? "text" : "password"}
                      name="oldPassword"
                      id="oldPassword"
                      value={passwordForm.oldPassword}
                      onChange={handlePasswordChange}
                      className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility("old")}
                      className="absolute right-4 top-[42px] text-gray-500 hover:text-dark focus:outline-none"
                    >
                      {showPassword.old ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>

                  <div className="mb-5 relative">
                    <label htmlFor="newPassword" className="block mb-2.5">
                      Mật khẩu mới
                    </label>

                    <input
                      type={showPassword.new ? "text" : "password"}
                      name="newPassword"
                      id="newPassword"
                      value={passwordForm.newPassword}
                      onChange={handlePasswordChange}
                      className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility("new")}
                      className="absolute right-4 top-[42px] text-gray-500 hover:text-dark focus:outline-none"
                    >
                      {showPassword.new ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>

                  <div className="mb-5 relative">
                    <label
                      htmlFor="confirmNewPassword"
                      className="block mb-2.5"
                    >
                      Xác nhận mật khẩu mới
                    </label>

                    <input
                      type={showPassword.confirm ? "text" : "password"}
                      name="confirmNewPassword"
                      id="confirmNewPassword"
                      value={passwordForm.confirmNewPassword}
                      onChange={handlePasswordChange}
                      className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                      required
                    />
                     
                  </div>

                  <button
                    type="submit"
                    disabled={loadingPassword}
                    className="inline-flex font-medium text-white bg-blue py-3 px-7 rounded-md ease-out duration-200 hover:bg-blue-dark disabled:opacity-70"
                  >
                    {loadingPassword ? "Đang đổi..." : "Đổi Mật Khẩu"}
                  </button>
                </div>
              </form>
            </div>
            {/* <!-- details tab content end -->
          <!--== user dashboard content end ==--> */}
          </div>
        </div>
      </section>

      <AddressModal 
        isOpen={addressModal} 
        closeModal={closeAddressModal} 
        currentUser={user}
      />

      <ConfirmModal
        isOpen={showAvatarConfirm}
        onCancel={() => setShowAvatarConfirm(false)}
        onConfirm={handleConfirmAvatarChange}
        title="Đổi ảnh đại diện"
        message="Bạn có chắc chắn muốn thay đổi ảnh đại diện hiện tại? Hành động này sẽ thay thế ảnh cũ."
        confirmText="Đồng ý"
        cancelText="Hủy bỏ"
        type="info"
      />

       <ConfirmModal
        isOpen={showPasswordConfirmModal}
        onCancel={() => setShowPasswordConfirmModal(false)}
        onConfirm={handleConfirmPasswordChange}
        title="Đổi mật khẩu"
        message="Bạn có chắc chắn muốn đổi mật khẩu? Bạn sẽ cần sử dụng mật khẩu mới cho lần đăng nhập sau."
        confirmText="Đồng ý"
        cancelText="Hủy"
        type="warning"
      />

      <ConfirmModal
        isOpen={formError.show}
        onCancel={() => setFormError({ ...formError, show: false })}
        onConfirm={() => setFormError({ ...formError, show: false })}
        title={formError.title}
        message={formError.message}
        confirmText="Đóng"
        cancelText="" // Empty to effectively have one main action if styled that way, or just 'Đóng'
        type="danger"
      />
    </>
  );
};

export default MyAccount;
