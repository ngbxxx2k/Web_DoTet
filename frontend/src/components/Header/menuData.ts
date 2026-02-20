import { Menu } from "@/types/Menu";

export const menuData: Menu[] = [
  {
    id: 1,
    title: "Trang Chủ",
    newTab: false,
    path: "/",
  },
  {
    id: 2,
    title: "Cửa Hàng",
    newTab: false,
    path: "/shop-with-sidebar",
  },
  {
    id: 3,
    title: "Liên Hệ",
    newTab: false,
    path: "/contact",
  },
  {
    id: 6,
    title: "Trang",
    newTab: false,
    path: "/",
    submenu: [
      {
        id: 61,
        title: "Cửa Hàng (Sidebar)",
        newTab: false,
        path: "/shop-with-sidebar",
      },
      {
        id: 62,
        title: "Cửa Hàng (Full)",
        newTab: false,
        path: "/shop-without-sidebar",
      },
      {
        id: 64,
        title: "Thanh Toán",
        newTab: false,
        path: "/checkout",
      },
      {
        id: 65,
        title: "Giỏ Hàng",
        newTab: false,
        path: "/cart",
      },
      {
        id: 66,
        title: "Yêu Thích",
        newTab: false,
        path: "/wishlist",
      },
      {
        id: 67,
        title: "Đăng Nhập",
        newTab: false,
        path: "/signin",
      },
      {
        id: 68,
        title: "Đăng Ký",
        newTab: false,
        path: "/signup",
      },
      {
        id: 69,
        title: "Tài Khoản",
        newTab: false,
        path: "/my-account",
      },
      {
        id: 70,
        title: "Liên Hệ",
        newTab: false,
        path: "/contact",
      },
      {
        id: 62,
        title: "Lỗi",
        newTab: false,
        path: "/error",
      },
      {
        id: 63,
        title: "Thông Báo Email",
        newTab: false,
        path: "/mail-success",
      },
    ],
  },
  // {  
  //   id: 7,
  //   title: "blogs",
  //   newTab: false,
  //   path: "/",
  //   submenu: [
  //     {
  //       id: 71,
  //       title: "Blog Grid with sidebar",
  //       newTab: false,
  //       path: "/blogs/blog-grid-with-sidebar",
  //     },
  //     {
  //       id: 72,
  //       title: "Blog Grid",
  //       newTab: false,
  //       path: "/blogs/blog-grid",
  //     },
  //     {
  //       id: 73,
  //       title: "Blog details with sidebar",
  //       newTab: false,
  //       path: "/blogs/blog-details-with-sidebar",
  //     },
  //     {
  //       id: 74,
  //       title: "Blog details",
  //       newTab: false,
  //       path: "/blogs/blog-details",
  //     },
  //   ],
  // },
];
