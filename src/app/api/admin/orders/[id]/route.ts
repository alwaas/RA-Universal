import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireAdminSession } from "@/lib/auth/rbac";
import { OrderService } from "@/lib/services/order.service";

export const dynamic = "force-dynamic";

const updateOrderSchema = z.object({
  orderStatus: z.enum(["pending", "confirmed", "shipped", "delivered", "cancelled"]).optional(),
  paymentStatus: z.enum(["pending_whatsapp", "paid", "cod"]).optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdminSession(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await request.json();
    const validated = updateOrderSchema.parse(body);

    const success = await OrderService.updateOrderStatus(
      params.id,
      validated.orderStatus,
      validated.paymentStatus
    );

    if (!success) {
      return NextResponse.json(
        { success: false, error: { code: "ORDER_NOT_FOUND", message: "Order not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: { status: "updated" } });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: { code: "ORDER_UPDATE_FAILED", message: err.message || "Failed to update order" } },
      { status: 500 }
    );
  }
}
