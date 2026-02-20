import { Category } from "@/types/category";

export const mockCategories: Category[] = [
  {
    id: 1,
    parentId: null,
    title: "Electronics",
    slug: "electronics",
    level: 0,
    isActive: true,
    productCount: 1204,
    children: [
      {
        id: 2,
        parentId: 1,
        title: "Computers",
        slug: "electronics/computers",
        level: 1,
        isActive: true,
        productCount: 450,
        children: [
            {
                id: 3,
                parentId: 2,
                title: "Laptops",
                slug: "electronics/computers/laptops",
                level: 2,
                isActive: false, // Hidden
                productCount: 120,
                description: "Gaming and Business Laptops",
                imageUrl: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=300&q=80",
                children: []
            },
            {
                id: 4,
                parentId: 2,
                title: "Desktops",
                slug: "electronics/computers/desktops",
                level: 2,
                isActive: true,
                productCount: 85,
                children: []
            }
        ]
      },
      {
        id: 5,
        parentId: 1,
        title: "Smartphones",
        slug: "electronics/smartphones",
        level: 1,
        isActive: true,
        productCount: 600,
        children: []
      }
    ]
  },
  {
    id: 6,
    parentId: null,
    title: "Clothing",
    slug: "clothing",
    level: 0,
    isActive: true,
    productCount: 3500,
    children: [
        {
            id: 7,
            parentId: 6,
            title: "Men",
            slug: "clothing/men",
            level: 1,
            isActive: true,
            productCount: 1500,
            children: []
        },
        {
            id: 8,
            parentId: 6,
            title: "Women",
            slug: "clothing/women",
            level: 1,
            isActive: true,
            productCount: 2000,
            children: []
        }
    ]
  },
  {
      id: 9,
      parentId: null,
      title: "Home & Garden",
      slug: "home-garden",
      level: 0,
      isActive: true,
      productCount: 980,
      children: []
  }
];
