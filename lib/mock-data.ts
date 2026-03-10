import { PurchaseOrder, Supplier } from './types';

export const SUPPLIERS: Supplier[] = [
  {
    id: 'supp-001',
    name: 'Supplies Corp',
    email: 'contact@suppliescorp.com',
    phone: '+1 (555) 123-4567',
    address: '123 Business Ave',
    city: 'Commerce City',
    country: 'USA',
    taxId: 'TAX-001234567',
    category: 'Office Supplies',
  },
  {
    id: 'supp-002',
    name: 'Tech Distributors Inc',
    email: 'sales@techdist.com',
    phone: '+1 (555) 987-6543',
    address: '456 Tech Park',
    city: 'Silicon Valley',
    country: 'USA',
    taxId: 'TAX-987654321',
    category: 'Technology',
  },
  {
    id: 'supp-003',
    name: 'Office Materials Ltd',
    email: 'info@officemat.com',
    phone: '+1 (555) 555-5555',
    address: '789 Corporate Plaza',
    city: 'Downtown',
    country: 'USA',
    taxId: 'TAX-555555555',
    category: 'Furniture',
  },
];

let mockOrders: PurchaseOrder[] = [
  {
    id: 'order-001',
    orderNumber: 'PO-2025-001',
    supplierId: 'supp-001',
    supplier: SUPPLIERS[0],
    createdAt: '2025-01-15T10:30:00Z',
    estimatedDelivery: '2025-01-25T00:00:00Z',
    deliveryDate: '2025-01-24T15:30:00Z',
    status: 'pending',
    paymentTerms: 'Net 30',
    paymentMethod: 'Bank Transfer',
    shippingMethod: 'Express Shipping',
    shippingCost: 25.00,
    tax: 10.25,
    discount: 5.00,
    currency: 'USD',
    purchaseBy: 'John Smith',
    approvedBy: 'Sarah Johnson',
    items: [
      { description: 'Office Paper A4 (500 sheets)', quantity: 10, unitPrice: 5.99 },
      { description: 'Ballpoint Pens (Box of 50)', quantity: 5, unitPrice: 12.50 },
    ],
    total: 121.45,
    notes: 'Please expedite delivery to main office',
    internalNotes: 'Standard order, high priority client',
  },
  {
    id: 'order-002',
    orderNumber: 'PO-2025-002',
    supplierId: 'supp-002',
    supplier: SUPPLIERS[1],
    createdAt: '2025-01-16T14:20:00Z',
    estimatedDelivery: '2025-01-30T00:00:00Z',
    status: 'approved',
    paymentTerms: 'Net 60',
    paymentMethod: 'Credit Card',
    shippingMethod: 'Standard Shipping',
    shippingCost: 45.00,
    tax: 72.00,
    discount: 0,
    currency: 'USD',
    purchaseBy: 'Mike Davis',
    approvedBy: 'Robert Chen',
    items: [
      { description: 'Wireless Keyboard', quantity: 8, unitPrice: 45.99 },
      { description: 'USB-C Hub', quantity: 12, unitPrice: 29.99 },
      { description: 'Monitor Stand', quantity: 6, unitPrice: 34.50 },
    ],
    total: 896.22,
    internalNotes: 'Tech equipment for new office setup',
  },
  {
    id: 'order-003',
    orderNumber: 'PO-2025-003',
    supplierId: 'supp-003',
    supplier: SUPPLIERS[2],
    createdAt: '2025-01-17T09:15:00Z',
    estimatedDelivery: '2025-02-05T00:00:00Z',
    status: 'pending',
    paymentTerms: 'Net 45',
    paymentMethod: 'Bank Transfer',
    shippingMethod: 'Ground Shipping',
    shippingCost: 85.00,
    tax: 108.80,
    discount: 20.00,
    currency: 'USD',
    purchaseBy: 'Emily Rodriguez',
    approvedBy: 'David Wilson',
    items: [
      { description: 'Executive Desk (Oak)', quantity: 2, unitPrice: 299.99 },
      { description: 'Ergonomic Chair', quantity: 4, unitPrice: 189.99 },
    ],
    total: 1359.96,
    notes: 'Delivery to main office',
    internalNotes: 'High value order - verify delivery',
  },
  {
    id: 'order-004',
    orderNumber: 'PO-2025-004',
    supplierId: 'supp-001',
    supplier: SUPPLIERS[0],
    createdAt: '2025-01-14T11:45:00Z',
    status: 'cancelled',
    paymentTerms: 'Net 30',
    paymentMethod: 'Bank Transfer',
    shippingMethod: 'Standard Shipping',
    shippingCost: 0,
    tax: 6.40,
    discount: 0,
    currency: 'USD',
    purchaseBy: 'John Smith',
    items: [
      { description: 'Sticky Notes (Pack of 12)', quantity: 20, unitPrice: 3.99 },
    ],
    total: 79.80,
    internalNotes: 'Cancelled due to alternative supplier found',
  },
  {
    id: 'order-005',
    orderNumber: 'PO-2025-005',
    supplierId: 'supp-002',
    supplier: SUPPLIERS[1],
    createdAt: '2025-01-18T16:00:00Z',
    estimatedDelivery: '2025-02-10T00:00:00Z',
    status: 'pending',
    paymentTerms: 'Net 30',
    paymentMethod: 'Credit Card',
    shippingMethod: 'Express Shipping',
    shippingCost: 55.00,
    tax: 34.00,
    discount: 0,
    currency: 'USD',
    purchaseBy: 'Mike Davis',
    approvedBy: 'Robert Chen',
    items: [
      { description: 'External SSD 1TB', quantity: 3, unitPrice: 99.99 },
      { description: 'Laptop Stand', quantity: 5, unitPrice: 24.99 },
    ],
    total: 424.95,
    internalNotes: 'Storage upgrade for IT department',
  },
];

export function getOrderById(id: string): PurchaseOrder | undefined {
  return mockOrders.find((order) => order.id === id);
}

export function getAllOrders(): PurchaseOrder[] {
  return mockOrders;
}

export function searchOrders(query: string): PurchaseOrder[] {
  const lowerQuery = query.toLowerCase();
  return mockOrders.filter(
    (order) =>
      order.orderNumber?.toLowerCase().includes(lowerQuery) ||
      SUPPLIERS.find(s => s.id === order.supplierId)?.name.toLowerCase().includes(lowerQuery) ||
      order.status.toLowerCase().includes(lowerQuery)
  );
}

export function createOrder(orderData: Omit<PurchaseOrder, 'id' | 'createdAt' | 'orderNumber'>): PurchaseOrder {
  const id = `order-${Date.now()}`;
  const orderNumber = `PO-${new Date().getFullYear()}-${mockOrders.length + 1}`;
  const order: PurchaseOrder = {
    id,
    orderNumber,
    createdAt: new Date().toISOString(),
    ...orderData,
  };
  mockOrders.push(order);
  return order;
}

export function updateOrder(id: string, orderData: Omit<PurchaseOrder, 'id' | 'createdAt' | 'orderNumber'>): PurchaseOrder | null {
  const index = mockOrders.findIndex(o => o.id === id);
  if (index === -1) return null;
  mockOrders[index] = {
    ...mockOrders[index],
    ...orderData,
  };
  return mockOrders[index];
}

export function deleteOrder(id: string): boolean {
  const index = mockOrders.findIndex(o => o.id === id);
  if (index === -1) return false;
  mockOrders.splice(index, 1);
  return true;
}
