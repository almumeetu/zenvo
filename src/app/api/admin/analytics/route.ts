/**
 * /api/admin/analytics — Live administrative metrics & telemetry API
 *
 * Proxies to deployed API server (GET https://api-zenov.bornobyte.com/api/admin/analytics)
 * with admin bearer token authentication and Supabase fallback.
 */

import { NextResponse } from 'next/server';
import { API_BASE_URL } from '@/lib/config';
import { getAuthHeaders } from '@/lib/api-auth';
import { supabaseAdmin } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function GET(request: Request) {
  // 1. Fetch live metrics directly from deployed NestJS API
  try {
    const apiRes = await fetch(`${API_BASE_URL}/admin/analytics`, {
      cache: 'no-store',
      headers: getAuthHeaders(request),
    });

    if (apiRes.ok) {
      const data = await apiRes.json();
      if (data.success && data.analytics) {
        return NextResponse.json(data);
      }
    }
  } catch (err: any) {
    console.warn('[API Proxy /admin/analytics GET] Primary API server error, calculating from Supabase fallback:', err?.message || err);
  }

  // 2. Resilient fallback: Compute analytics from Supabase
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({
        success: true,
        analytics: {
          totalRevenue: 0,
          totalOrdersCount: 0,
          activeProductsCount: 0,
          registeredUsersCount: 0,
          walletFloatUSD: 0,
          salesByDay: [],
          categoryDistribution: [],
          securityLogs: [],
        },
      });
    }

    const [ordersRes, productsRes, usersRes] = await Promise.allSettled([
      supabaseAdmin.from('orders').select('id, totalUSD, paymentStatus, createdAt'),
      supabaseAdmin.from('products').select('id, inStock, category'),
      supabaseAdmin.from('profiles').select('id, walletBalanceUSD'),
    ]);

    const orders = ordersRes.status === 'fulfilled' && ordersRes.value.data ? ordersRes.value.data : [];
    const products = productsRes.status === 'fulfilled' && productsRes.value.data ? productsRes.value.data : [];
    const users = usersRes.status === 'fulfilled' && usersRes.value.data ? usersRes.value.data : [];

    const totalRevenue = orders
      .filter((o: any) => o.paymentStatus === 'Completed' || o.paymentStatus === 'Delivered')
      .reduce((sum: number, o: any) => sum + (Number(o.totalUSD) || 0), 0);

    const walletFloatUSD = users.reduce((sum: number, u: any) => sum + (Number(u.walletBalanceUSD) || 0), 0);

    return NextResponse.json({
      success: true,
      analytics: {
        totalRevenue,
        totalOrdersCount: orders.length,
        activeProductsCount: products.filter((p: any) => p.inStock !== false).length,
        registeredUsersCount: users.length,
        walletFloatUSD,
        salesByDay: [],
        categoryDistribution: [],
        securityLogs: [],
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err?.message || 'Analytics error' }, { status: 500 });
  }
}
