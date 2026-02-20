
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

export interface AttributeValue {
  id: number;
  value: string;
  colorCode?: string;
}

export interface Attribute {
  id: number;
  name: string;
  values: AttributeValue[];
}

export const AttributeService = {
  async getAll(): Promise<Attribute[]> {
    const res = await fetch(`${API_URL}/attributes`, { cache: 'no-store' });
    if (!res.ok) throw new Error("Failed to fetch attributes");
    return res.json();
  }
};
