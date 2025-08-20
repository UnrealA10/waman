import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ShoppingBag,
  CreditCard,
  Truck,
  Lock,
  CheckCircle,
  MessageCircle,
  QrCode,
} from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import QR from "./assets/WhatsApp Image 2025-07-25 at 21.23.09_9208ba4f.jpg";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const checkoutSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  address: z.string().min(10, "Please enter your full address"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  pincode: z.string().min(6, "Please enter a valid pincode"),
  shippingMethod: z.enum(["premium", "simple"]),
  paymentMethod: z.enum(["razorpay", "cod", "upi"]),
  notes: z.string().optional(),
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

const ADMIN_PHONE_NUMBER = "+917893765031";
const CUSTOMER_SUPPORT_NUMBER = "+917893765031";

const CheckoutPage = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showUpiQr, setShowUpiQr] = useState(false);
  const { items: cartItems, totalAmount, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const razorpayLoaded = useRef(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      paymentMethod: "razorpay",
      shippingMethod: "premium",
    },
  });

  const paymentMethod = watch("paymentMethod");
  const shippingMethod = watch("shippingMethod");

  const shippingCost = shippingMethod === "premium" ? 299 : 199;
  const finalTotal = totalAmount + shippingCost;

  const codMinOrder = 199;
  const isCodDisabled = finalTotal < codMinOrder;

  useEffect(() => {
    if (paymentMethod !== "upi") {
      setShowUpiQr(false);
    }
  }, [paymentMethod]);

  useEffect(() => {
    if (isCodDisabled && paymentMethod === "cod") {
      setValue("paymentMethod", "razorpay"); // Reset to a default valid option
    }
  }, [isCodDisabled, paymentMethod, setValue]);

  useEffect(() => {
    if (razorpayLoaded.current) return;

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => {
      razorpayLoaded.current = true;
    };
    document.body.appendChild(script);

    return () => {
      // Clean up the script when the component unmounts
      const a_script = document.querySelector(
        `script[src="https://checkout.razorpay.com/v1/checkout.js"]`
      );
      if (a_script) document.body.removeChild(a_script);
    };
  }, []);

  const composeWhatsAppMessage = (
    formData: CheckoutForm,
    paymentId?: string
  ) => {
    const shippingInfo = `*SHIPPING INFORMATION*%0A📛 *Name:* ${
      formData.fullName || ""
    }%0A📧 *Email:* ${formData.email || ""}%0A📱 *Phone:* ${
      formData.phone || ""
    }%0A🏠 *Address:* ${formData.address || ""}%0A📍 *City:* ${
      formData.city || ""
    }%0A🏛️ *State:* ${formData.state || ""}%0A📮 *Pincode:* ${
      formData.pincode || ""
    }`;

    const orderItems = cartItems
      .map((item) => {
        const itemDetails = `➡️ ${item.name} (x${item.quantity}) - ₹${(
          item.price * item.quantity
        ).toLocaleString()}`;
        const imageUrlLine = item.image ? `%0A🖼️ Photo: ${item.image}` : "";
        return `${itemDetails}${imageUrlLine}`;
      })
      .join("%0A%0A");

    const orderSummary = `*ORDER SUMMARY*%0A${orderItems}%0A%0A💲 *Subtotal:* ₹${totalAmount.toLocaleString()}%0A🚚 *Shipping (${
      formData.shippingMethod === "premium" ? "Premium" : "Simple"
    })*: ₹${shippingCost.toLocaleString()}%0A💳 *Payment Method:* ${
      formData.paymentMethod === "cod"
        ? "Cash on Delivery"
        : formData.paymentMethod === "upi"
        ? "UPI Payment (Confirmed)"
        : "Online Payment"
    }%0A✅ *Total:* ₹${finalTotal.toLocaleString()}`;

    const paymentInfo = paymentId
      ? `%0A%0A*PAYMENT CONFIRMED*%0A🔐 Payment ID: ${paymentId}`
      : "";
    const notesSection = formData.notes
      ? `%0A%0A*NOTES*%0A${formData.notes}`
      : "";
    const messageText = `*NEW ORDER REQUEST - Wamanhaus.com*%0A%0A${shippingInfo}%0A%0A${orderSummary}${paymentInfo}${notesSection}%0A%0A_This is your order confirmation._`;

    return {
      text: messageText,
      baseUrl: `https://wa.me/${CUSTOMER_SUPPORT_NUMBER}`,
    };
  };

  const handleManualOrder = () => {
    const formData = getValues();
    const { text, baseUrl } = composeWhatsAppMessage(formData);
    const whatsappUrl = `${baseUrl}?text=${text}`;
    window.open(whatsappUrl, "_blank");
    toast({
      title: "Redirecting to WhatsApp...",
      description:
        "Please send the pre-filled message to confirm your order details.",
    });
  };

  const sendAdminWhatsAppNotification = (
    formData: CheckoutForm,
    paymentId?: string
  ) => {
    const { text } = composeWhatsAppMessage(formData, paymentId);
    const adminUrl = `https://wa.me/${ADMIN_PHONE_NUMBER}?text=${text}`;
    // This will open a new tab for the admin notification.
    // Note: Pop-up blockers may still interfere. A server-side solution is more reliable.
    window.open(adminUrl, "_blank");
  };

  const saveOrderToDatabase = async (
    formData: CheckoutForm,
    paymentId?: string
  ) => {
    if (!user) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to place an order.",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }
    const orderData = {
      user_id: user.id,
      items: cartItems,
      total_amount: finalTotal,
      shipping_address: {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
      },
      shipping_method: formData.shippingMethod,
      payment_method: formData.paymentMethod,
      payment_id: paymentId || null,
      status: formData.paymentMethod === "cod" ? "pending" : "paid",
      notes: formData.notes,
    };
    const { error } = await supabase.from("orders").insert([orderData]);
    if (error) throw error;
  };

  const initiateRazorpayPayment = (formData: CheckoutForm) => {
    return new Promise((resolve, reject) => {
      if (!window.Razorpay) {
        toast({
          title: "Payment Gateway Not Loaded",
          description:
            "Razorpay script is not available. Please refresh the page.",
          variant: "destructive",
        });
        return reject(new Error("Razorpay not loaded"));
      }

      const rzp = new window.Razorpay({
        key: "rzp_test_2Hjv5J4dK9XkH0",
        amount: finalTotal * 100,
        currency: "INR",
        name: "Waman Haus",
        description: "Clothing Purchase",
        image: "/logo.png",
        handler: async (response: any) => {
          try {
            await saveOrderToDatabase(formData, response.razorpay_payment_id);
            clearCart();
            toast({
              title: "Payment Successful!",
              description: "Your order has been confirmed.",
            });
            sendAdminWhatsAppNotification(
              formData,
              response.razorpay_payment_id
            );
            navigate("/");
            resolve(response.razorpay_payment_id);
          } catch (error) {
            reject(error);
          }
        },
        prefill: {
          name: formData.fullName,
          email: formData.email,
          contact: formData.phone,
        },
        notes: {
          address: formData.address,
        },
        theme: {
          color: "#F37254",
        },
        modal: {
          ondismiss: () => {
            // This is crucial for handling when the user closes the modal
            setIsProcessing(false);
            toast({
              title: "Payment Canceled",
              description: "You have canceled the payment.",
              variant: "destructive",
            });
            reject(new Error("Payment canceled by user"));
          },
        },
      });

      rzp.on("payment.failed", function (response: any) {
        toast({
          title: "Payment Failed",
          description: response.error.description,
          variant: "destructive",
        });
        setIsProcessing(false);
        reject(response.error);
      });

      rzp.open();
    });
  };

  const onSubmit = async (data: CheckoutForm) => {
    setIsProcessing(true);

    if (data.paymentMethod === "cod" && isCodDisabled) {
      toast({
        title: "Minimum Order Requirement",
        description: `Cash on Delivery requires a minimum order of ₹${codMinOrder}`,
        variant: "destructive",
      });
      setIsProcessing(false);
      return;
    }

    try {
      if (data.paymentMethod === "razorpay") {
        await initiateRazorpayPayment(data);
        // The rest of the logic is handled within the Razorpay handler
        return; // Early return to prevent further execution
      }

      if (data.paymentMethod === "upi") {
        if (!showUpiQr) {
          setShowUpiQr(true);
          setIsProcessing(false);
          toast({
            title: "Scan the QR Code to Pay",
            description:
              "After paying, click the 'I Have Paid' button to confirm.",
          });
          return;
        }

        const paymentId = `UPI_MANUAL_${Date.now()}`;
        await saveOrderToDatabase(data, paymentId);
        clearCart();
        toast({
          title: "Payment Confirmed!",
          description: "Your order has been successfully placed.",
        });
        sendAdminWhatsAppNotification(data, paymentId);
        navigate("/");
        return;
      }

      if (data.paymentMethod === "cod") {
        await saveOrderToDatabase(data);
        clearCart();
        toast({
          title: "Order Placed Successfully!",
          description: "You will receive a confirmation message shortly.",
        });
        sendAdminWhatsAppNotification(data);
        navigate("/");
      }
    } catch (err) {
      console.error("Order placement error:", err);
      toast({
        title: "Order Failed",
        description: "There was an error placing your order. Please try again.",
        variant: "destructive",
      });
      // Ensure processing is set to false on failure, unless it's a Razorpay user-cancel
      if (paymentMethod !== "razorpay") {
        setIsProcessing(false);
      }
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <ShoppingBag className="w-24 h-24 mx-auto text-primary-400 mb-4" />
          <h1 className="text-3xl font-heading font-bold text-primary-700 mb-4">
            Your Cart is Empty
          </h1>
          <p className="text-muted-foreground mb-8">
            Add some items to your cart before proceeding to checkout.
          </p>
          <Button
            className="bg-primary-600 hover:bg-primary-700 text-white"
            onClick={() => navigate("/collections")}
          >
            Start Shopping
          </Button>
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
          <CreditCard className="h-8 w-8 text-primary-700" />
          <h1 className="text-3xl font-heading font-bold text-primary-700">
            Checkout
          </h1>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary-700">
                  <Truck className="h-5 w-5" /> Shipping Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input id="fullName" {...register("fullName")} />
                    {errors.fullName && (
                      <p className="text-red-500 text-sm">
                        {errors.fullName.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input id="email" type="email" {...register("email")} />
                    {errors.email && (
                      <p className="text-red-500 text-sm">
                        {errors.email.message}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input id="phone" {...register("phone")} />
                  {errors.phone && (
                    <p className="text-red-500 text-sm">
                      {errors.phone.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="address">Full Address *</Label>
                  <Textarea id="address" {...register("address")} />
                  {errors.address && (
                    <p className="text-red-500 text-sm">
                      {errors.address.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input id="city" {...register("city")} />
                    {errors.city && (
                      <p className="text-red-500 text-sm">
                        {errors.city.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="state">State *</Label>
                    <Input id="state" {...register("state")} />
                    {errors.state && (
                      <p className="text-red-500 text-sm">
                        {errors.state.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="pincode">Pincode *</Label>
                    <Input id="pincode" {...register("pincode")} />
                    {errors.pincode && (
                      <p className="text-red-500 text-sm">
                        {errors.pincode.message}
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <Label htmlFor="notes">Order Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    {...register("notes")}
                    placeholder="Any special instructions for your order..."
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary-700">
                  <Truck className="h-5 w-5" /> Shipping Method
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={shippingMethod}
                  onValueChange={(value) =>
                    setValue("shippingMethod", value as "premium" | "simple", {
                      shouldValidate: true,
                    })
                  }
                >
                  <div className="flex items-center space-x-2 p-4 border rounded-lg mb-4">
                    <RadioGroupItem value="premium" id="premium" />
                    <Label
                      htmlFor="premium"
                      className="flex-1 cursor-pointer flex items-center justify-between"
                    >
                      <div>
                        <p className="font-medium">Premium Shipping</p>
                        <p className="text-sm text-muted-foreground">
                          2-3 Business Days
                        </p>
                      </div>
                      <span className="font-semibold">₹299</span>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-4 border rounded-lg">
                    <RadioGroupItem value="simple" id="simple" />
                    <Label
                      htmlFor="simple"
                      className="flex-1 cursor-pointer flex items-center justify-between"
                    >
                      <div>
                        <p className="font-medium">Simple Shipping</p>
                        <p className="text-sm text-muted-foreground">
                          5-7 Business Days
                        </p>
                      </div>
                      <span className="font-semibold">₹199</span>
                    </Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary-700">
                  <CreditCard className="h-5 w-5" /> Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={(value) =>
                    setValue(
                      "paymentMethod",
                      value as "razorpay" | "cod" | "upi"
                    )
                  }
                >
                  <div className="flex items-center space-x-2 p-4 border rounded-lg mb-4">
                    <RadioGroupItem value="razorpay" id="razorpay" />
                    <Label htmlFor="razorpay" className="flex-1 cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium mb-1.5 flex items-center">
                            Online Payment
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Pay with Razorpay (Cards, UPI, Net Banking)
                          </p>
                        </div>
                        <Lock className="h-4 w-4 text-green-600" />
                      </div>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2 p-4 border rounded-lg mb-4">
                    <RadioGroupItem value="upi" id="upi" />
                    <Label htmlFor="upi" className="flex-1 cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium mb-1.5">UPI / QR Code</p>
                          <p className="text-sm text-muted-foreground">
                            Pay by scanning a QR code.
                          </p>
                        </div>
                        <QrCode className="h-4 w-4 text-green-600" />
                      </div>
                    </Label>
                  </div>

                  <div
                    className={`flex items-center space-x-2 p-4 border rounded-lg ${
                      isCodDisabled ? "opacity-50" : ""
                    }`}
                  >
                    <RadioGroupItem
                      value="cod"
                      id="cod"
                      disabled={isCodDisabled}
                    />
                    <Label
                      htmlFor="cod"
                      className={`flex-1 ${
                        isCodDisabled ? "cursor-not-allowed" : "cursor-pointer"
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium mb-1.5">
                              Cash on Delivery
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Pay when your order is delivered
                            </p>
                          </div>
                          <Badge
                            variant="secondary"
                            className="ml-2 bg-amber-100 text-amber-800"
                          >
                            ₹{codMinOrder} min
                          </Badge>
                        </div>
                        {isCodDisabled && (
                          <p className="text-xs text-red-500 mt-2">
                            Minimum order of ₹{codMinOrder} required for COD
                          </p>
                        )}
                      </div>
                    </Label>
                  </div>
                </RadioGroup>

                {showUpiQr && (
                  <div className="mt-6 p-4 border-2 border-dashed border-primary-500 rounded-lg bg-primary-50">
                    <div className="text-center">
                      <p className="font-semibold text-lg text-primary-800 mb-2">
                        Scan to Pay ₹{finalTotal.toLocaleString()}
                      </p>
                      <img
                        src={QR}
                        alt="UPI QR Code"
                        className="mx-auto my-4 rounded-md shadow-md"
                        width="180"
                        height="180"
                      />
                      <p className="text-sm text-muted-foreground">
                        After paying, click the confirmation button below to
                        complete your order.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="text-primary-700">
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="max-h-60 overflow-y-auto space-y-3">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="w-12 h-12 rounded bg-muted flex-shrink-0">
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover rounded"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium line-clamp-1">
                          {item.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Qty: {item.quantity}
                        </p>
                      </div>
                      <p className="text-sm font-medium">
                        ₹{(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>₹{shippingCost.toLocaleString()}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>₹{finalTotal.toLocaleString()}</span>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-primary-600 hover:bg-primary-700 text-white"
                  disabled={
                    isProcessing || (paymentMethod === "cod" && isCodDisabled)
                  }
                >
                  {isProcessing ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </div>
                  ) : paymentMethod === "upi" && showUpiQr ? (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />I Have Paid, Confirm
                      Order
                    </div>
                  ) : paymentMethod === "upi" ? (
                    <div className="flex items-center gap-2">
                      <QrCode className="h-4 w-4" />
                      Proceed to Pay with UPI
                    </div>
                  ) : paymentMethod === "razorpay" ? (
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      Pay ₹{finalTotal.toLocaleString()}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Place Order
                    </div>
                  )}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  🔒 Your information is secure and encrypted
                </p>

                <div className="mt-4 pt-4 border-t border-border">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleManualOrder}
                    type="button"
                  >
                    <MessageCircle className="mr-2 h-5 w-5" />
                    Help or Manual Order
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default CheckoutPage;
