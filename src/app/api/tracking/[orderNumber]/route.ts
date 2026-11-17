import { NextResponse } from "next/server";
import { OrderService } from "@/lib/services/order.service";

interface RouteParams {
  params: {
    orderNumber: string;
  };
}

export async function GET(_req: Request, { params }: RouteParams) {
  try {
    const rawNumber = params.orderNumber || "";
    const cleanNumber = decodeURIComponent(rawNumber).trim().toUpperCase();

    if (!cleanNumber) {
      return NextResponse.json(
        { success: false, error: { message: "Order number is required" } },
        { status: 400 }
      );
    }

    const allOrders = await OrderService.getOrders();
    const order = allOrders.find(
      (o) =>
        (o.orderNumber || "").trim().toUpperCase() === cleanNumber ||
        (o.id || "").trim().toUpperCase() === cleanNumber
    );

    if (!order) {
      return NextResponse.json(
        { success: false, error: { message: `No order found matching "${cleanNumber}"` } },
        { status: 404 }
      );
    }

    // Courier tracking lookup URL helper
    let trackingUrl: string | null = null;
    if (order.trackingNumber && order.trackingCourier) {
      const courier = order.trackingCourier.toLowerCase();
      if (courier.includes("delhivery")) {
        trackingUrl = `https://www.delhivery.com/track/package/${order.trackingNumber}`;
      } else if (courier.includes("bluedart")) {
        trackingUrl = `https://www.bluedart.com/tracking?numbers=${order.trackingNumber}`;
      } else if (courier.includes("dtdc")) {
        trackingUrl = `https://www.dtdc.in/tracking/shipment-tracking.asp?trkType=awb&strAwbNo=${order.trackingNumber}`;
      } else if (courier.includes("post")) {
        trackingUrl = `https://www.indiapost.gov.in/_layouts/15/dpt.cept.tracking/trackconsignment.aspx`;
      }
    }

    const trackingData = {
      orderNumber: order.orderNumber,
      orderStatus: order.orderStatus,
      paymentStatus: order.paymentStatus,
      paymentGateway: order.paymentGateway,
      customerName: order.customerName,
      customerPhone: order.customerPhone ? `******${order.customerPhone.slice(-4)}` : "N/A",
      shippingCity: order.shippingCity,
      shippingState: order.shippingState,
      shippingPincode: order.shippingPincode,
      totalAmount: order.totalAmount,
      items: order.items,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      trackingCourier: order.trackingCourier || null,
      trackingNumber: order.trackingNumber || null,
      trackingUrl,
    };

    return NextResponse.json({ success: true, data: trackingData });
  } catch (error) {
    console.error("[TrackingAPI] Failed to get tracking:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to look up tracking details" } },
      { status: 500 }
    );
  }
}
