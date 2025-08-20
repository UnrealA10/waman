import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, Package, Users, ShoppingCart, TrendingUp } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import AdminStats from "@/components/admin/AdminStats";
import ProductManager from "@/components/admin/ProductManager";

const AdminPage = () => {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
  });
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const { data: ordersData } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });
      const { data: productsData } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });
      const { data: usersData } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      setOrders(ordersData || []);
      setProducts(productsData || []);
      setUsers(usersData || []);
      const totalRevenue =
        ordersData?.reduce((sum, order) => sum + order.total_amount, 0) || 0;
      setStats({
        totalRevenue,
        totalOrders: ordersData?.length || 0,
        totalProducts: productsData?.length || 0,
        totalUsers: usersData?.length || 0,
      });
    } catch (error) {
      console.error("Error fetching admin data:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (
    orderId: string,
    newStatus:
      | "pending"
      | "confirmed"
      | "processing"
      | "shipped"
      | "delivered"
      | "cancelled"
  ) => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: newStatus })
        .eq("id", orderId);

      if (error) throw error;

      fetchAdminData();
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "processing":
        return "bg-purple-100 text-purple-800";
      case "shipped":
        return "bg-indigo-100 text-indigo-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="grid grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto"
      >
        <div className="flex items-center gap-3 mb-8">
          <Shield className="h-8 w-8 text-deep-brown" />
          <h1 className="text-3xl font-heading font-bold text-deep-brown">
            Admin Dashboard
          </h1>
        </div>

        {/* Stats Overview */}
        <div className="mb-8">
          <AdminStats stats={stats} />
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              Orders
            </TabsTrigger>
            <TabsTrigger value="products" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Products
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Users
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {orders.slice(0, 5).map((order) => (
                      <div
                        key={order.id}
                        className="flex items-center justify-between p-3 border rounded"
                      >
                        <div>
                          <p className="font-medium">#{order.id.slice(0, 8)}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(order.created_at), "MMM dd, yyyy")}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge className={getStatusColor(order.status)}>
                            {order.status}
                          </Badge>
                          <p className="text-sm font-medium">
                            ₹{order.total_amount.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Products</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {products.slice(0, 5).map((product) => (
                      <div
                        key={product.id}
                        className="flex items-center gap-3 p-3 border rounded"
                      >
                        <div className="w-12 h-12 bg-muted rounded overflow-hidden">
                          {product.images && product.images.length > 0 ? (
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs">
                              No Image
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium line-clamp-1">
                            {product.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            ₹{product.price} • Stock: {product.stock_quantity}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Order Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="font-medium">
                            Order #{order.id.slice(0, 8)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {format(
                              new Date(order.created_at),
                              "MMM dd, yyyy HH:mm"
                            )}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge className={getStatusColor(order.status)}>
                            {order.status}
                          </Badge>
                          <p className="text-sm font-medium mt-1">
                            ₹{order.total_amount.toFixed(2)}
                          </p>
                        </div>
</div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p>
                            <strong>Payment:</strong>{" "}
                            {order.payment_method === "cod"
                              ? "Cash on Delivery"
                              : "Online"}
                          </p>
                          <p>
                            <strong>Items:</strong>{" "}
                            {Array.isArray(order.items)
                              ? order.items.length
                              : 0}
                          </p>
                        </div>
                        <div>
                          <p>
                            <strong>Customer:</strong>{" "}
                            {order.shipping_address?.fullName}
                          </p>
                          <p>
                            <strong>Phone:</strong>{" "}
                            {order.shipping_address?.phone}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2 mt-3">
                        {order.status === "pending" && (
                          <Button
                            size="sm"
                            onClick={() =>
                              updateOrderStatus(order.id, "confirmed")
                            }
                          >
                            Confirm
                          </Button>
                        )}
                        {order.status === "confirmed" && (
                          <Button
                            size="sm"
                            onClick={() =>
                              updateOrderStatus(order.id, "processing")
                            }
                          >
                            Process
                          </Button>
                        )}
                        {order.status === "processing" && (
                          <Button
                            size="sm"
                            onClick={() =>
                              updateOrderStatus(order.id, "shipped")
                            }
                          >
                            Ship
                          </Button>
                        )}
                        {order.status === "shipped" && (
                          <Button
                            size="sm"
                            onClick={() =>
                              updateOrderStatus(order.id, "delivered")
                            }
                          >
                            Delivered
                          </Button>
                        )}
                        {order.status !== "cancelled" &&
                          order.status !== "delivered" && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() =>
                                updateOrderStatus(order.id, "cancelled")
                              }
                            >
                              Cancel
                            </Button>
                          )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="products">
            <Card>
              <CardHeader>
                <CardTitle>Product Management</CardTitle>
              </CardHeader>
              <CardContent>
                <ProductManager
                  products={products}
                  onProductsChange={fetchAdminData}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-4 border rounded"
                    >
                      <div>
                        <p className="font-medium">
                          {user.full_name || "No Name"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {user.phone || "No Phone"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Joined:{" "}
                          {format(new Date(user.created_at), "MMM dd, yyyy")}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className="capitalize">
                          {user.role || "customer"}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          Wishlist:{" "}
                          {Array.isArray(user.wishlist)
                            ? user.wishlist.length
                            : 0}{" "}
                          items
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
};

export default AdminPage;