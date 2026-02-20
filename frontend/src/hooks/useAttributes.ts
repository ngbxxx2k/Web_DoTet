import { useState, useEffect } from "react";
import toast from "react-hot-toast";

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

export function useAttributes() {
    const [attributes, setAttributes] = useState<Attribute[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchAttributes = async () => {
        setLoading(true);
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";
            const res = await fetch(`${API_URL}/attributes`);
            if (res.ok) {
                const data = await res.json();
                setAttributes(data);
            } else {
                toast.error("Failed to load attributes");
            }
        } catch (error) {
            console.error("Failed to fetch attributes", error);
            toast.error("Failed to connect to attributes service");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAttributes();
    }, []);

    return { attributes, loading, refreshAttributes: fetchAttributes };
}
