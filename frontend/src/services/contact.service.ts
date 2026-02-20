
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

export interface ContactRequest {
  firstName: string;
  lastName: string;
  email: string; // Added email
  subject: string;
  phone: string;
  message: string;
}

export const ContactService = {
  async sendContact(data: ContactRequest): Promise<void> {
    const res = await fetch(`${API_URL}/contact/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Failed to send message");
    }
  },
};
