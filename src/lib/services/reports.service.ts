import { OrderService } from "@/lib/services/order.service";
import { ProductService } from "@/lib/services/product.service";
import type { AnalyticsReport, Order } from "@/types";

export class ReportsService {
  static async getAnalytics(): Promise<AnalyticsReport> {
    const orders = await OrderService.getOrders();
    const productsRes = await ProductService.getProducts();
    const products = Array.isArray(productsRes) ? productsRes : (productsRes?.products || []);

    const validOrders = orders.filter((o) => o.orderStatus !== "cancelled");
    const totalRevenue = validOrders.reduce((acc, o) => acc + (o.totalAmount || 0), 0);
    const totalOrders = orders.length;
    const completedOrders = orders.filter((o) =>
      ["confirmed", "packed", "shipped", "delivered"].includes(o.orderStatus)
    ).length;
    const pendingOrders = orders.filter((o) => o.orderStatus === "pending").length;
    const cancelledOrders = orders.filter((o) => o.orderStatus === "cancelled").length;
    const averageOrderValue = validOrders.length > 0 ? Math.round(totalRevenue / validOrders.length) : 0;

    // Daily breakdown for the last 7 days
    const dailyMap = new Map<string, { amount: number; count: number }>();
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split("T")[0];
      dailyMap.set(key, { amount: 0, count: 0 });
    }

    validOrders.forEach((o) => {
      const dateKey = (o.createdAt || "").split("T")[0];
      if (dailyMap.has(dateKey)) {
        const curr = dailyMap.get(dateKey)!;
        curr.amount += o.totalAmount || 0;
        curr.count += 1;
      }
    });

    const dailyRevenue = Array.from(dailyMap.entries()).map(([date, val]) => ({
      date,
      amount: val.amount,
      count: val.count,
    }));

    // Weekly and Monthly aggregations
    const monthlyMap = new Map<string, { amount: number; count: number }>();
    validOrders.forEach((o) => {
      const monthKey = (o.createdAt || "").substring(0, 7); // YYYY-MM
      if (monthKey) {
        const curr = monthlyMap.get(monthKey) || { amount: 0, count: 0 };
        curr.amount += o.totalAmount || 0;
        curr.count += 1;
        monthlyMap.set(monthKey, curr);
      }
    });

    const monthlyRevenue = Array.from(monthlyMap.entries()).map(([month, val]) => ({
      month,
      amount: val.amount,
      count: val.count,
    }));

    // Category breakdown
    let scarvesRev = 0;
    let scarvesCount = 0;
    let gamchasRev = 0;
    let gamchasCount = 0;

    validOrders.forEach((o) => {
      (o.items || []).forEach((item) => {
        const title = (item.title || "").toLowerCase();
        if (title.includes("gamcha")) {
          gamchasRev += (item.sellingPrice || 0) * (item.quantity || 1);
          gamchasCount += item.quantity || 1;
        } else {
          scarvesRev += (item.sellingPrice || 0) * (item.quantity || 1);
          scarvesCount += item.quantity || 1;
        }
      });
    });

    const categoryBreakdown = [
      {
        category: "Handcrafted Scarves & Dupattas",
        count: scarvesCount,
        revenue: scarvesRev,
      },
      {
        category: "Artisanal Cotton Gamchas",
        count: gamchasCount,
        revenue: gamchasRev,
      },
    ];

    // Low stock products (stock <= 3)
    const lowStockProducts = products.filter((p) => p.stockCount <= 3);

    return {
      totalRevenue,
      totalOrders,
      averageOrderValue,
      completedOrders,
      pendingOrders,
      cancelledOrders,
      dailyRevenue,
      weeklyRevenue: dailyRevenue.map((d, i) => ({
        week: `Day ${i + 1}`,
        amount: d.amount,
        count: d.count,
      })),
      monthlyRevenue,
      categoryBreakdown,
      lowStockProducts,
    };
  }
}
