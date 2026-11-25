import mongoose from 'mongoose';
import { cloudinary, isCloudinaryConfigured } from '../config/cloudinary.js';
import { getSystemTelemetrySnapshot } from '../middleware/telemetryMiddleware.js';
import { AIUsage } from '../models/AIUsage.js';
import { AnalyticsEvent } from '../models/AnalyticsEvent.js';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { User } from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const PENDING_ORDER_STATUSES = [
  'PLACED',
  'CONFIRMED',
  'PREPARING',
  'READY FOR DISPATCH',
  'SHIPPED',
  'OUT FOR DELIVERY',
];

export const getAdminDashboard = asyncHandler(async (_req, res) => {
  const since14Days = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

  const [
    orderSummaryAgg,
    totalCustomers,
    products,
    recentOrders,
    salesTrends,
    bestsellingProducts,
  ] = await Promise.all([
    Order.aggregate([
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          pendingOrders: {
            $sum: { $cond: [{ $in: ['$status', PENDING_ORDER_STATUSES] }, 1, 0] },
          },
          completedOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'DELIVERED'] }, 1, 0] },
          },
          cancelledOrders: {
            $sum: { $cond: [{ $in: ['$status', ['CANCELLED', 'REFUNDED']] }, 1, 0] },
          },
          grossActiveRevenue: {
            $sum: {
              $cond: [
                { $in: ['$status', ['CANCELLED', 'REFUNDED']] },
                0,
                '$pricing.totalAmount',
              ],
            },
          },
          verifiedPaidRevenue: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$paymentStatus', 'PAID'] },
                    { $not: [{ $in: ['$status', ['CANCELLED', 'REFUNDED']] }] },
                  ],
                },
                '$pricing.totalAmount',
                0,
              ],
            },
          },
          activeOrderCount: {
            $sum: {
              $cond: [{ $in: ['$status', ['CANCELLED', 'REFUNDED']] }, 0, 1],
            },
          },
        },
      },
    ]),
    User.countDocuments({ role: 'customer' }),
    Product.find()
      .select('name slug categoryName isActive variants')
      .lean(),
    Order.find()
      .sort({ createdAt: -1 })
      .limit(8)
      .populate('user', 'name email phone')
      .lean(),
    Order.aggregate([
      {
        $match: {
          createdAt: { $gte: since14Days },
          status: { $nin: ['CANCELLED', 'REFUNDED'] },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          orders: { $sum: 1 },
          revenue: { $sum: '$pricing.totalAmount' },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    Order.aggregate([
      { $match: { status: { $nin: ['CANCELLED', 'REFUNDED'] } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          name: { $first: '$items.name' },
          unitsSold: { $sum: '$items.quantity' },
          revenue: { $sum: '$items.lineTotal' },
        },
      },
      { $sort: { unitsSold: -1, revenue: -1 } },
      { $limit: 5 },
    ]),
  ]);

  const summary = orderSummaryAgg[0] || {
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
    grossActiveRevenue: 0,
    verifiedPaidRevenue: 0,
    activeOrderCount: 0,
  };

  const averageOrderValue =
    summary.activeOrderCount > 0
      ? Math.round(summary.grossActiveRevenue / summary.activeOrderCount)
      : 0;

  const lowStockAlerts = [];
  for (const prod of products) {
    for (const v of prod.variants || []) {
      const threshold = v.lowStockThreshold ?? 5;
      if (v.stock <= threshold) {
        lowStockAlerts.push({
          productId: String(prod._id),
          productName: prod.name,
          slug: prod.slug,
          variantId: String(v._id),
          variantLabel: v.label,
          sku: v.sku,
          stock: v.stock,
          lowStockThreshold: threshold,
        });
      }
    }
  }

  res.status(200).json({
    success: true,
    metrics: {
      totalRevenue: summary.grossActiveRevenue,
      verifiedPaidRevenue: summary.verifiedPaidRevenue,
      totalOrders: summary.totalOrders,
      pendingOrders: summary.pendingOrders,
      completedOrders: summary.completedOrders,
      cancelledOrders: summary.cancelledOrders,
      totalCustomers,
      averageOrderValue,
      lowStockCount: lowStockAlerts.length,
    },
    lowStockAlerts,
    recentOrders,
    salesTrends: salesTrends.map((t) => ({
      date: t._id,
      orders: t.orders,
      revenue: t.revenue,
    })),
    bestsellingProducts,
  });
});

export const getAdminAnalytics = asyncHandler(async (_req, res) => {
  const now = Date.now();
  const since14Days = new Date(now - 14 * 24 * 60 * 60 * 1000);
  const since12Weeks = new Date(now - 84 * 24 * 60 * 60 * 1000);
  const since6Months = new Date(now - 180 * 24 * 60 * 60 * 1000);

  const [
    dailyRevenue,
    weeklyRevenue,
    monthlyRevenue,
    productPerformance,
    categoryPerformance,
    customerGrowth,
    funnelCounts,
    visitorAgg,
  ] = await Promise.all([
    Order.aggregate([
      {
        $match: {
          createdAt: { $gte: since14Days },
          status: { $nin: ['CANCELLED', 'REFUNDED'] },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          orders: { $sum: 1 },
          revenue: { $sum: '$pricing.totalAmount' },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    Order.aggregate([
      {
        $match: {
          createdAt: { $gte: since12Weeks },
          status: { $nin: ['CANCELLED', 'REFUNDED'] },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%G-W%V', date: '$createdAt' } },
          orders: { $sum: 1 },
          revenue: { $sum: '$pricing.totalAmount' },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    Order.aggregate([
      {
        $match: {
          createdAt: { $gte: since6Months },
          status: { $nin: ['CANCELLED', 'REFUNDED'] },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          orders: { $sum: 1 },
          revenue: { $sum: '$pricing.totalAmount' },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    Order.aggregate([
      { $match: { status: { $nin: ['CANCELLED', 'REFUNDED'] } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          productName: { $first: '$items.name' },
          unitsSold: { $sum: '$items.quantity' },
          revenue: { $sum: '$items.lineTotal' },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 10 },
    ]),
    Order.aggregate([
      { $match: { status: { $nin: ['CANCELLED', 'REFUNDED'] } } },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.product',
          foreignField: '_id',
          as: 'prodDoc',
        },
      },
      {
        $group: {
          _id: {
            $ifNull: [
              { $arrayElemAt: ['$prodDoc.categoryName', 0] },
              'Uncategorized',
            ],
          },
          unitsSold: { $sum: '$items.quantity' },
          revenue: { $sum: '$items.lineTotal' },
        },
      },
      { $sort: { revenue: -1 } },
    ]),
    User.aggregate([
      { $match: { role: 'customer', createdAt: { $gte: since6Months } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          newCustomers: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    AnalyticsEvent.aggregate([
      {
        $match: {
          eventType: {
            $in: [
              'PAGE_VIEW',
              'PRODUCT_VIEW',
              'ADD_TO_CART',
              'CHECKOUT_START',
              'PURCHASE_COMPLETED',
            ],
          },
        },
      },
      { $group: { _id: '$eventType', count: { $sum: 1 } } },
    ]),
    AnalyticsEvent.aggregate([
      { $match: { visitorId: { $ne: '' } } },
      { $group: { _id: null, uniqueVisitors: { $addToSet: '$visitorId' } } },
      { $project: { count: { $size: '$uniqueVisitors' } } },
    ]),
  ]);

  const countMap = new Map(funnelCounts.map((f) => [f._id, f.count]));
  const totalVisitors = visitorAgg[0]?.count || 0;
  const pageViews = countMap.get('PAGE_VIEW') || 0;
  const productViews = countMap.get('PRODUCT_VIEW') || 0;
  const cartAdditions = countMap.get('ADD_TO_CART') || 0;
  const checkoutStarts = countMap.get('CHECKOUT_START') || 0;
  const completedPurchases = countMap.get('PURCHASE_COMPLETED') || 0;

  const funnelBase = totalVisitors > 0 ? totalVisitors : productViews;
  const conversionRate =
    funnelBase > 0 ? Math.round((completedPurchases / funnelBase) * 10000) / 100 : 0;

  res.status(200).json({
    success: true,
    dailyRevenue: dailyRevenue.map((d) => ({ period: d._id, orders: d.orders, revenue: d.revenue })),
    weeklyRevenue: weeklyRevenue.map((d) => ({ period: d._id, orders: d.orders, revenue: d.revenue })),
    monthlyRevenue: monthlyRevenue.map((d) => ({ period: d._id, orders: d.orders, revenue: d.revenue })),
    productPerformance,
    categoryPerformance: categoryPerformance.map((c) => ({
      category: c._id,
      unitsSold: c.unitsSold,
      revenue: c.revenue,
    })),
    customerGrowth: customerGrowth.map((c) => ({
      month: c._id,
      newCustomers: c.newCustomers,
    })),
    funnel: {
      totalVisitors,
      pageViews,
      productViews,
      cartAdditions,
      checkoutStarts,
      completedPurchases,
      conversionRate,
    },
  });
});

export const getAdminUsageMeter = asyncHandler(async (_req, res) => {
  const since30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const since180Days = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000);

  const [
    aiTotalsAgg,
    aiDailyAgg,
    aiMonthlyAgg,
    aiRecentErrors,
    websiteEventsAgg,
    visitorAgg,
    dbApiAgg,
  ] = await Promise.all([
    AIUsage.aggregate([
      {
        $group: {
          _id: null,
          totalRequests: { $sum: 1 },
          failedRequests: { $sum: { $cond: ['$success', 0, 1] } },
          inputTokens: { $sum: '$inputTokens' },
          outputTokens: { $sum: '$outputTokens' },
          estimatedCostUsd: { $sum: '$estimatedCostUsd' },
          avgLatencyMs: { $avg: '$latencyMs' },
        },
      },
    ]),
    AIUsage.aggregate([
      { $match: { createdAt: { $gte: since30Days } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          requests: { $sum: 1 },
          failed: { $sum: { $cond: ['$success', 0, 1] } },
          inputTokens: { $sum: '$inputTokens' },
          outputTokens: { $sum: '$outputTokens' },
          estimatedCostUsd: { $sum: '$estimatedCostUsd' },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    AIUsage.aggregate([
      { $match: { createdAt: { $gte: since180Days } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          requests: { $sum: 1 },
          inputTokens: { $sum: '$inputTokens' },
          outputTokens: { $sum: '$outputTokens' },
          estimatedCostUsd: { $sum: '$estimatedCostUsd' },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    AIUsage.find({ success: false })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('model promptSnippet errorMessage latencyMs createdAt')
      .lean(),
    AnalyticsEvent.aggregate([
      {
        $match: {
          eventType: {
            $in: [
              'PAGE_VIEW',
              'PRODUCT_VIEW',
              'ADD_TO_CART',
              'CHECKOUT_START',
              'PURCHASE_COMPLETED',
            ],
          },
        },
      },
      { $group: { _id: '$eventType', count: { $sum: 1 } } },
    ]),
    AnalyticsEvent.aggregate([
      { $match: { visitorId: { $ne: '' } } },
      { $group: { _id: null, uniqueVisitors: { $addToSet: '$visitorId' } } },
      { $project: { count: { $size: '$uniqueVisitors' } } },
    ]),
    AnalyticsEvent.aggregate([
      { $match: { eventType: { $in: ['API_REQUEST', 'API_ERROR'] } } },
      {
        $group: {
          _id: null,
          totalApiRequests: { $sum: 1 },
          apiErrorCount: {
            $sum: { $cond: [{ $eq: ['$eventType', 'API_ERROR'] }, 1, 0] },
          },
          avgResponseTimeMs: { $avg: '$responseTimeMs' },
        },
      },
    ]),
  ]);

  const aiSummary = aiTotalsAgg[0] || {
    totalRequests: 0,
    failedRequests: 0,
    inputTokens: 0,
    outputTokens: 0,
    estimatedCostUsd: 0,
    avgLatencyMs: 0,
  };

  const eventMap = new Map(websiteEventsAgg.map((e) => [e._id, e.count]));
  const totalVisitors = visitorAgg[0]?.count || 0;
  const pageViews = eventMap.get('PAGE_VIEW') || 0;
  const productViews = eventMap.get('PRODUCT_VIEW') || 0;
  const cartAdditions = eventMap.get('ADD_TO_CART') || 0;
  const checkoutStarts = eventMap.get('CHECKOUT_START') || 0;
  const completedPurchases = eventMap.get('PURCHASE_COMPLETED') || 0;
  const baseVisitors = totalVisitors > 0 ? totalVisitors : productViews;
  const conversionRate =
    baseVisitors > 0
      ? Math.round((completedPurchases / baseVisitors) * 10000) / 100
      : 0;

  let imageStorage = {
    configured: isCloudinaryConfigured(),
    available: false,
    usedBytes: null,
    usedCredits: null,
    plan: null,
    note: 'Cloudinary credentials not configured in backend/.env yet.',
  };

  if (imageStorage.configured) {
    try {
      const usage = await cloudinary.api.usage();
      imageStorage = {
        configured: true,
        available: true,
        usedBytes: usage?.storage?.usage ?? 0,
        usedCredits: usage?.credits?.usage ?? null,
        plan: usage?.plan ?? 'Standard',
        note: 'Live Cloudinary storage usage measured via Admin API.',
      };
    } catch (err) {
      imageStorage = {
        configured: true,
        available: false,
        usedBytes: null,
        usedCredits: null,
        plan: null,
        note: err?.message || 'Unable to query Cloudinary usage endpoint.',
      };
    }
  }

  const telemetry = getSystemTelemetrySnapshot();
  const dbApiStats = dbApiAgg[0] || {
    totalApiRequests: 0,
    apiErrorCount: 0,
    avgResponseTimeMs: 0,
  };

  const READY_STATE_LABELS = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  const dbStateIndex = mongoose.connection.readyState;

  res.status(200).json({
    success: true,
    ai: {
      totalRequests: aiSummary.totalRequests,
      failedRequests: aiSummary.failedRequests,
      inputTokens: aiSummary.inputTokens,
      outputTokens: aiSummary.outputTokens,
      estimatedCostUsd: Math.round((aiSummary.estimatedCostUsd || 0) * 100000) / 100000,
      avgLatencyMs: Math.round(aiSummary.avgLatencyMs || 0),
      dailyUsage: aiDailyAgg.map((d) => ({ date: d._id, ...d })),
      monthlyUsage: aiMonthlyAgg.map((m) => ({ month: m._id, ...m })),
      recentErrors: aiRecentErrors,
    },
    website: {
      totalVisitors,
      pageViews,
      productViews,
      cartAdditions,
      checkoutStarts,
      completedPurchases,
      conversionRate,
    },
    system: {
      avgApiResponseMs:
        Math.round(dbApiStats.avgResponseTimeMs || 0) || telemetry.avgResponseMs,
      inMemoryAvgResponseMs: telemetry.avgResponseMs,
      maxResponseMs: telemetry.maxResponseMs,
      totalTrackedRequests: dbApiStats.totalApiRequests || telemetry.totalTrackedRequests,
      backendErrors: dbApiStats.apiErrorCount || telemetry.totalTrackedErrors,
      recentBackendErrors: telemetry.recentErrors,
      uptimeSeconds: Math.round(process.uptime()),
      memoryRssMb: Math.round(process.memoryUsage().rss / (1024 * 1024)),
      database: {
        connected: dbStateIndex === 1,
        state: READY_STATE_LABELS[dbStateIndex] || 'unknown',
        name: mongoose.connection.name || null,
      },
      imageStorage,
    },
  });
});
