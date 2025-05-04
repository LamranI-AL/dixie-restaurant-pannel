/** @format */

"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Printer, Eye, Download } from "lucide-react";
import { Order, OrderStatus } from "@/lib/types";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Link from "next/link";
import { getAllOrders } from "@/actions/ordres";
import { formatDate } from "@/utils/format-date";

// Mock order data
const mockOrders: Order[] = [
  {
    id: "1",
    orderNumber: "100160",
    customerName: "Jane Doe",
    customerPhone: "+8**********",
    customerEmail: "jane.doe@example.com",
    items: [],
    subtotal: 1300,
    tax: 102.49,
    deliveryFee: 0,
    packagingFee: 0,
    discount: 0,
    total: 1402.49,
    paymentStatus: "unpaid",
    paymentMethod: "cash",
    orderStatus: "pending",
    orderDate: new Date("2025-04-05T10:13:00"),
    restaurantId: "rest1",
    deliveryDate: new Date("2025-04-05T10:13:00"),
    notes: "Please deliver to the back door.",
    customerAddress: "123 Main St, Springfield, IL",
    OrderStatus: "pending",
  },
  {
    id: "2",
    orderNumber: "100157",
    customerName: "Brooklyn Simmons",
    customerPhone: "+8**********",
    customerEmail: "brooklyn@example.com",
    items: [],
    subtotal: 2200,
    tax: 199.99,
    deliveryFee: 0,
    packagingFee: 0,
    discount: 0,
    total: 2399.99,
    paymentStatus: "paid",
    paymentMethod: "card",
    orderStatus: "delivered",
    orderDate: new Date("2024-01-02T06:44:00"),
    restaurantId: "rest1",
    deliveryDate: new Date("2025-04-05T10:13:00"),
    notes: "Please deliver to the back door.",
    customerAddress: "123 Main St, Springfield, IL",
    OrderStatus: "pending",
  },
  {
    id: "3",
    orderNumber: "100156",
    customerName: "John Doe",
    customerPhone: "+8**********",
    customerEmail: "john.doe@example.com",
    items: [],
    subtotal: 5800,
    tax: 516.64,
    deliveryFee: 0,
    packagingFee: 0,
    discount: 0,
    total: 6316.64,
    paymentStatus: "paid",
    paymentMethod: "card",
    orderStatus: "delivered",
    orderDate: new Date("2023-11-21T04:21:00"),
    restaurantId: "rest1",
    deliveryDate: new Date("2025-04-05T10:13:00"),
    notes: "Please deliver to the back door.",
    customerAddress: "123 Main St, Springfield, IL",
    OrderStatus: "pending",
  },
  {
    id: "4",
    orderNumber: "100155",
    customerName: "John Doe",
    customerPhone: "+8**********",
    customerEmail: "john.doe@example.com",
    items: [],
    subtotal: 2600,
    tax: 227.14,
    deliveryFee: 0,
    packagingFee: 0,
    discount: 0,
    total: 2827.14,
    paymentStatus: "paid",
    paymentMethod: "card",
    orderStatus: "delivered",
    orderDate: new Date("2023-11-21T04:08:00"),
    restaurantId: "rest1",
    deliveryDate: new Date("2025-04-05T10:13:00"),
    notes: "Please deliver to the back door.",
    customerAddress: "123 Main St, Springfield, IL",
    OrderStatus: "pending",
  },
  {
    id: "5",
    orderNumber: "100154",
    customerName: "John Doe",
    customerPhone: "+8**********",
    customerEmail: "john.doe@example.com",
    items: [],
    subtotal: 2600,
    tax: 227.14,
    deliveryFee: 0,
    packagingFee: 0,
    discount: 0,
    total: 2827.14,
    paymentStatus: "paid",
    paymentMethod: "card",
    orderStatus: "delivered",
    orderDate: new Date("2023-11-21T04:04:00"),
    restaurantId: "rest1",
    deliveryDate: new Date("2025-04-05T10:13:00"),
    notes: "Please deliver to the back door.",
    customerAddress: "123 Main St, Springfield, IL",
    OrderStatus: "pending",
  },
];

const getStatusColor = (status: OrderStatus): string => {
  const statusColors: Record<OrderStatus, string> = {
    pending: "bg-blue-100 text-blue-600",
    confirmed: "bg-green-100 text-green-600",
    accepted: "bg-green-100 text-green-600",
    cooking: "bg-amber-100 text-amber-600",
    "ready-for-delivery": "bg-purple-100 text-purple-600",
    "on-the-way": "bg-pink-100 text-pink-600",
    delivered: "bg-emerald-100 text-emerald-600",
    "dine-in": "bg-indigo-100 text-indigo-600",
    refunded: "bg-red-100 text-red-600",
    "refund-requested": "bg-red-100 text-red-600",
    scheduled: "bg-cyan-100 text-cyan-600",
    "payment-failed": "bg-red-100 text-red-600",
    canceled: "bg-gray-100 text-gray-600",
  };

  return statusColors[status] || "bg-gray-100 text-gray-600";
};

const getPaymentStatusColor = (
  status: "paid" | "unpaid" | "refunded",
): string => {
  const statusColors = {
    paid: "text-green-600",
    unpaid: "text-red-500",
    refunded: "text-amber-600",
  };

  return statusColors[status] || "text-gray-600";
};

export default function OrdersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);

  const exportData = () => {
    // Implement your export logic here
    const doc = new jsPDF();

    autoTable(doc, {
      html: "#orders-table",
      styles: { fontSize: 10 },
      theme: "grid",
      headStyles: { fillColor: [22, 160, 133] },
    });

    doc.save("Orders.pdf");
  };
  const generateOrderTicketPDF = (order: Order) => {
    const doc = new jsPDF();

    // Title
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Bon de Commande", 105, 15, { align: "center" });

    // Client Info
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const leftStart = 14;
    let y = 30;
    doc.text(`Commande N° : ${order.orderNumber}`, leftStart, y);
    doc.text(
      `Date : ${new Date(order.orderDate).toLocaleString()}`,
      leftStart,
      (y += 6),
    );
    doc.text(`Client : ${order.customerName}`, leftStart, (y += 6));
    doc.text(`Téléphone : ${order.customerPhone}`, leftStart, (y += 6));
    doc.text(`Email : ${order.customerEmail}`, leftStart, (y += 6));
    doc.text(`Adresse : ${order.customerAddress}`, leftStart, (y += 6));

    // Items Table
    autoTable(doc, {
      startY: y + 10,
      head: [["Produit", "Quantité", "Prix Unitaire", "Total"]],
      body: order.items.map((item) => [
        item.name,
        item.quantity.toString(),
        `${item.price && item.price?.toFixed(2)} MAD`,
        `${item.price && (item.price * item.quantity).toFixed(2)} MAD`,
      ]),
      styles: { halign: "center" },
      headStyles: { fillColor: [0, 150, 136] },
    });

    // Totals & Payment Info
    const finalY = (doc as any).lastAutoTable?.finalY || 90;
    const rightX = 140;
    const lineSpacing = 6;
    let lineY = finalY + 10;

    doc.text(
      `Sous-total : ${order.subtotal ? order.subtotal.toFixed(2) : "0 "} MAD`,
      rightX,
      lineY,
    );
    doc.text(
      `TVA : ${order.tax ? order.tax.toFixed(2) : "0"} MAD`,
      rightX,
      (lineY += lineSpacing),
    );
    doc.text(
      `Livraison : ${
        order.deliveryFee ? order.deliveryFee.toFixed(2) : "0"
      } MAD`,
      rightX,
      (lineY += lineSpacing),
    );
    doc.text(
      `Emballage : ${
        order.packagingFee ? order.packagingFee.toFixed(2) : "0"
      } MAD`,
      rightX,
      (lineY += lineSpacing),
    );
    doc.text(
      `Remise : ${order.discount ? order.discount.toFixed(2) : "0"} MAD`,
      rightX,
      (lineY += lineSpacing),
    );
    doc.setFont("helvetica", "bold");
    doc.text(
      `Total : ${order.total ? order.total.toFixed(2) : "0"} MAD`,
      rightX,
      (lineY += lineSpacing),
    );
    doc.setFont("helvetica", "normal");

    // Payment Info
    lineY += 12;
    doc.text(`Statut de paiement : ${order.paymentStatus}`, leftStart, lineY);
    doc.text(
      `Méthode : ${order.paymentMethod}`,
      leftStart,
      (lineY += lineSpacing),
    );
    doc.text(
      `Statut commande : ${order.orderStatus}`,
      leftStart,
      (lineY += lineSpacing),
    );

    // Save
    doc.save(`commande-${order.orderNumber}.pdf`);
  };
  useEffect(() => {
    const fetchFoods = async () => {
      const { success, orders } = await getAllOrders();
      console.log(orders);
      console.log(success);
      if (success) {
        setOrders(orders as Order[]);
      } else {
        console.error("Error fetching categories");
      }
    };
    fetchFoods();
  }, []);
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-6 w-6">
            <circle
              cx="8"
              cy="21"
              r="1"
            />
            <circle
              cx="19"
              cy="21"
              r="1"
            />
            <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
          </svg>
          <h2 className="text-2xl font-bold">All Orders</h2>
          <div className="ml-2 flex h-7 items-center justify-center rounded-full bg-blue-100 px-3 text-xs font-medium text-blue-500">
            {mockOrders.length} Orders
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Ex : Search by Order Id"
              className="w-[240px] pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button
            variant="outline"
            size="icon">
            <Search className="h-4 w-4" />
          </Button>
          <Button
            onClick={exportData}
            variant="outline"
            className="gap-1 items-center">
            <Download className="h-4 w-4 mr-1" />
            Export
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="ml-1 h-4 w-4">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </Button>
          <Button
            variant="outline"
            size="icon">
            <svg
              width="15"
              height="15"
              viewBox="0 0 15 15"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4">
              <path
                d="M5 2V1H10V2H5Z"
                fill="currentColor"
              />
              <path
                d="M1 13.25C1 13.6642 1.33579 14 1.75 14H13.25C13.6642 14 14 13.6642 14 13.25V5H1V13.25Z"
                fill="currentColor"
              />
              <path
                d="M14 3.5C14 3.22386 13.7761 3 13.5 3H1.5C1.22386 3 1 3.22386 1 3.5V4.5C1 4.77614 1.22386 5 1.5 5H13.5C13.7761 5 14 4.77614 14 4.5V3.5Z"
                fill="currentColor"
              />
            </svg>
          </Button>
        </div>
      </div>

      <Card className="border border-gray-200">
        <CardContent className="p-0">
          <Table id="orders-table">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-12 text-center">SI</TableHead>
                <TableHead>Order ID</TableHead>
                <TableHead>Order Date</TableHead>
                <TableHead>Customer Information</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Order Status</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order, index) => (
                <TableRow key={order.id}>
                  <TableCell className="text-center">{index + 1}</TableCell>
                  <TableCell>{order.orderNumber}</TableCell>
                  <TableCell>{formatDate(order.orderDate)}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{order.customerName}</div>
                      <div className="text-muted-foreground text-xs">
                        {order.customerPhone}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">
                      {/* $ {order.total ? order.total.toFixed(2) : "0.00"} */}
                    </div>
                    <div
                      className={`text-xs ${getPaymentStatusColor(
                        order.paymentStatus,
                      )}`}>
                      {order.paymentStatus.charAt(0).toUpperCase() +
                        order.paymentStatus.slice(1)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div
                      className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${getStatusColor(
                        order.orderStatus,
                      )}`}>
                      {order.orderStatus === "delivered"
                        ? "Delivered"
                        : "Pending"}
                    </div>
                    <div className="text-muted-foreground text-xs mt-1">
                      Delivery
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-center gap-1">
                      <Link href={`/orders/details/${order.id}`}>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-9 w-9">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        onClick={() => generateOrderTicketPDF(order)}
                        size="icon"
                        className="h-9 w-9">
                        <Printer className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
