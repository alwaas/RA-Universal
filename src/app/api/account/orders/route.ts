import { NextResponse, type NextRequest } from "next/server";
import { requireAuthSession } from "@/lib/auth/rbac";
import { OrderService } from "@/lib/services/order.service";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const authResult = await requireAuthSession(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const customerOrders = await OrderService.getOrdersForCustomer({
      userId: authResult.user.userId,
      phone: authResult.user.phone,
      email: authResult.user.email,
    });

    return NextResponse.json({
      success: true,
      data: customerOrders,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "CUSTOMER_ORDERS_FETCH_FAILED",
          message: err?.message || "Failed to retrieve your order history",
        },
      },
      { status: 500 }
    );
  }
}

