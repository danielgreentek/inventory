'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useUI } from './ui-context';
import { useAuth } from './auth-context';
import type { InventoryItem } from '@/types';

interface InventoryContextValue {
  items: InventoryItem[];
  isLoading: boolean;
  addItem: (item: InventoryItem) => Promise<void>;
  updateItem: (item: InventoryItem) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
}

const InventoryContext = createContext<InventoryContextValue | undefined>(undefined);

export function InventoryProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { setToastMessage } = useUI();
  const { user } = useAuth();

  const mapApiItem = (raw: any): InventoryItem => ({
    id: raw.id,
    item_code: raw.item_code || raw.itemCode,
    item_name: raw.item_name || raw.itemName,
    category: raw.category,
    brand: raw.brand,
    quantity: raw.stock ?? raw.quantity ?? 0,
    purchase_date: raw.purchase_date || (raw.purchaseDate ? raw.purchaseDate.slice(0, 10) : ''),
    branch: raw.branch,
    image_url: raw.image_url || raw.imageUrl || 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=400&q=80',
    units: Array.isArray(raw.units) ? raw.units : [],
    history: Array.isArray(raw.history) ? raw.history : [],
  });

  const fetchItems = async () => {
    setIsLoading(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('api_token') : null;
      const res = await fetch('/api/inventory', {
        headers: { Authorization: token ? `Bearer ${token}` : '', Accept: 'application/json' },
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          setItems(data.map(mapApiItem));
        }
      }
    } catch {
      // silent
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchItems();
    else {
      setItems([]);
      setIsLoading(false);
    }
  }, [user]);

  const addItem = async (item: InventoryItem) => {
    const previousItems = [...items];
    setItems((current) => [item, ...current]);

    try {
      const token = localStorage.getItem('api_token');
      const res = await fetch('/api/inventory', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          item_name: item.item_name,
          category: item.category,
          brand: item.brand,
          branch: item.branch,
          stock: item.quantity,
          purchase_date: item.purchase_date,
          image_url: item.image_url,
          units: item.units,
        }),
      });
      if (res.ok) {
        const saved = await res.json();
        setItems((current) => current.map((it) => (it.id === item.id ? mapApiItem(saved) : it)));
      } else {
        throw new Error('Gagal menyimpan');
      }
    } catch (err: any) {
      setItems(previousItems);
      setToastMessage(`Gagal menyimpan item: ${err.message}`);
    }
  };

  const updateItem = async (updatedItem: InventoryItem) => {
    const previousItems = [...items];
    setItems((current) => current.map((item) => (item.id === updatedItem.id ? updatedItem : item)));

    try {
      const token = localStorage.getItem('api_token');
      await fetch(`/api/inventory/${updatedItem.id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          item_name: updatedItem.item_name,
          category: updatedItem.category,
          brand: updatedItem.brand,
          branch: updatedItem.branch,
          stock: updatedItem.quantity,
          purchase_date: updatedItem.purchase_date,
          image_url: updatedItem.image_url,
          units: updatedItem.units,
        }),
      });
    } catch (err: any) {
      setItems(previousItems);
      setToastMessage(`Gagal memperbarui item: ${err.message}`);
    }
  };

  const deleteItem = async (id: string) => {
    const previousItems = [...items];
    setItems((current) => current.filter((item) => item.id !== id));

    try {
      const token = localStorage.getItem('api_token');
      await fetch(`/api/inventory/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      });
    } catch (err: any) {
      setItems(previousItems);
      setToastMessage(`Gagal menghapus item: ${err.message}`);
    }
  };

  return (
    <InventoryContext.Provider value={{ items, isLoading, addItem, updateItem, deleteItem }}>
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  const context = useContext(InventoryContext);
  if (!context) throw new Error('useInventory must be used within InventoryProvider');
  return context;
}
