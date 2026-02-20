"use client";
import React, { useState } from "react";
import Breadcrumb from "../Common/Breadcrumb";
import { ContactService, ContactRequest } from "@/services/contact.service";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/redux/store";

const Contact = () => {
  const router = useRouter();
  const settings = useAppSelector((state) => state.settingsReducer.settings);
  const [formData, setFormData] = useState<ContactRequest>({
    firstName: "",
    lastName: "",
    email: "",
    subject: "",
    phone: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Basic validation
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.message) {
      toast.error("Vui lòng điền đầy đủ các trường bắt buộc.");
      setLoading(false);
      return;
    }

    try {
      await ContactService.sendContact(formData);
      toast.success("Gửi tin nhắn thành công!");
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        subject: "",
        phone: "",
        message: "",
      });
      router.push("/mail-success");
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Gửi tin nhắn thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Breadcrumb title={"Liên Hệ"} pages={["Liên Hệ"]} />

      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="flex flex-col xl:flex-row gap-7.5">
            <div className="xl:max-w-[370px] w-full bg-white rounded-xl shadow-1">
              <div className="py-5 px-4 sm:px-7.5 border-b border-gray-3">
                <p className="font-medium text-xl text-dark">
                  Thông Tin Liên Hệ
                </p>
              </div>

              <div className="p-4 sm:p-7.5">
                <div className="flex flex-col gap-4">
                  {/* 1. Email */}
                  <div className="flex items-center gap-4">
                    <span className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M4 7.00005L10.2 11.65C11.2667 12.45 12.7333 12.45 13.8 11.65L20 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                    </span>
                    <p className="text-body-color text-base">
                       Email: <span className="font-medium text-dark">{settings['support_email'] || "support@example.com"}</span>
                    </p>
                  </div>

                  {/* 2. Store Name */}
                  <div className="flex items-center gap-4">
                     <span className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M3 21H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M5 21V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M19 21V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M5 7L12 3L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M10 21V14H14V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                     </span>
                     <p className="text-body-color text-base">
                        Cửa hàng: <span className="font-medium text-dark uppercase">{settings['store_name'] || "Nextmerce Store"}</span>
                     </p>
                  </div>
                  
                  {/* 3. Phone */}
                  <div className="flex items-center gap-4">
                    <span className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M22 16.92V19.92C22.0011 20.1986 21.9441 20.4742 21.8325 20.7294C21.7209 20.9846 21.5573 21.2137 21.3521 21.4019C21.1468 21.5902 20.9046 21.7336 20.6411 21.8228C20.3775 21.912 20.0987 21.9452 19.823 21.92C16.7424 21.5857 13.789 20.5262 11.16 18.78C8.75054 17.1633 6.70932 15.0645 5.09998 12.59C3.41503 10.0528 2.38379 7.21405 2.06998 4.23003C2.0436 3.95561 2.07548 3.67818 2.1635 3.41595C2.25152 3.15372 2.39371 2.91262 2.58079 2.70834C2.76788 2.50406 2.99571 2.34119 3.24939 2.23053C3.50308 2.11986 3.77678 2.06398 4.05298 2.06649L7.05298 2.06649C7.52554 2.06338 7.98188 2.23126 8.35624 2.54605C8.73061 2.86083 8.99564 3.3005 9.11298 3.79998C9.33306 4.75704 9.68969 5.68112 10.17 6.55005C10.3598 6.89882 10.4005 7.30948 10.2847 7.69186C10.1689 8.07424 9.9056 8.4011 9.54698 8.60998L8.27698 9.87999C9.69911 12.3804 11.7709 14.4522 14.2714 15.8742L15.5414 14.6042C15.7503 14.3953 16.0355 14.2581 16.3403 14.2197C16.6451 14.1812 16.9472 14.2443 17.1872 14.3965C18.0561 14.8768 18.9802 15.2334 19.9372 15.4535C20.4431 15.5727 20.8863 15.8427 21.2017 16.222C21.5172 16.6014 21.6826 17.0628 21.673 17.54L22 16.92Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </span>
                    <p className="text-body-color text-base">
                       Điện thoại: <span className="font-medium text-dark">{settings['support_phone'] || "1900 1234"}</span>
                    </p>
                  </div>

                  {/* 4. Address */}
                  <div className="flex items-center gap-4">
                    <span className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M12 13C13.6569 13 15 11.6569 15 10C15 8.34315 13.6569 7 12 7C10.3431 7 9 8.34315 9 10C9 11.6569 10.3431 13 12 13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </span>
                    <p className="text-body-color text-base">
                       Địa chỉ: <span className="font-medium text-dark">{settings['office_address'] || "TP. Hồ Chí Minh, Việt Nam"}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="xl:max-w-[770px] w-full bg-white rounded-xl shadow-1 p-4 sm:p-7.5 xl:p-10">
              <form onSubmit={handleSubmit}>
                <div className="flex flex-col lg:flex-row gap-5 sm:gap-8 mb-5">
                  <div className="w-full">
                    <label htmlFor="firstName" className="block mb-2.5">
                      Tên <span className="text-red">*</span>
                    </label>

                    <input
                      type="text"
                      name="firstName"
                      id="firstName"
                      placeholder="Tên"
                      value={formData.firstName}
                      onChange={handleChange}
                      className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                    />
                  </div>

                  <div className="w-full">
                    <label htmlFor="lastName" className="block mb-2.5">
                      Họ <span className="text-red">*</span>
                    </label>

                    <input
                      type="text"
                      name="lastName"
                      id="lastName"
                      placeholder="Họ"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                    />
                  </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-5 sm:gap-8 mb-5">
                  <div className="w-full">
                    <label htmlFor="email" className="block mb-2.5">
                      Địa chỉ Email <span className="text-red">*</span>
                    </label>

                    <input
                      type="email"
                      name="email"
                      id="email"
                      placeholder="nguyenvana@gmail.com"
                      value={formData.email}
                      onChange={handleChange}
                      className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                    />
                  </div>

                  <div className="w-full">
                    <label htmlFor="phone" className="block mb-2.5">
                      Số điện thoại
                    </label>

                    <input
                      type="text"
                      name="phone"
                      id="phone"
                      placeholder="Nhập số điện thoại"
                      value={formData.phone}
                      onChange={handleChange}
                      className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                    />
                  </div>
                </div>

                <div className="mb-5">
                  <label htmlFor="subject" className="block mb-2.5">
                    Tiêu Đề
                  </label>

                  <input
                    type="text"
                    name="subject"
                    id="subject"
                    placeholder="Nhập tiêu đề"
                    value={formData.subject}
                    onChange={handleChange}
                    className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                  />
                </div>

                <div className="mb-7.5">
                  <label htmlFor="message" className="block mb-2.5">
                    Nội Dung <span className="text-red">*</span>
                  </label>

                  <textarea
                    name="message"
                    id="message"
                    rows={5}
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Nhập nội dung lời nhắn..."
                    className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full p-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex font-medium text-white bg-blue py-3 px-7 rounded-md ease-out duration-200 hover:bg-blue-dark disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {loading ? "Đang gửi..." : "Gửi Tin Nhắn"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Contact;
