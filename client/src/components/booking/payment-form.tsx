import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { VenueWithDetails } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements
} from "@stripe/react-stripe-js";

// Load Stripe outside of component to avoid recreating on render
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

// Checkout form that uses Stripe Elements
function CheckoutForm({ onSuccess, onBack, totalAmount }: { 
  onSuccess: (paymentId: string) => void;
  onBack: () => void;
  totalAmount: number;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      // Confirm payment with Stripe
      const result = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',
      });

      if (result.error) {
        toast({
          title: "Payment failed",
          description: result.error.message || "An error occurred during payment processing",
          variant: "destructive",
        });
      } else {
        // Payment successful
        const paymentId = result.paymentIntent?.id || `PI_${Date.now()}`;
        onSuccess(paymentId);
        toast({
          title: "Payment successful",
          description: "Your payment has been processed successfully",
        });
      }
    } catch (error: any) {
      toast({
        title: "Payment error",
        description: error.message || "An error occurred during payment",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-4 border border-gray-200 rounded-md">
        <PaymentElement />
      </div>
      
      <div className="text-sm text-gray-500 mb-4">
        <p>Your payment is secure. You'll be charged ₹{totalAmount.toFixed(2)}</p>
      </div>
      
      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button 
          type="submit" 
          disabled={!stripe || isProcessing}
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            `Pay ₹${totalAmount.toFixed(2)}`
          )}
        </Button>
      </div>
    </form>
  );
}

type PaymentFormProps = {
  venue: VenueWithDetails;
  selectedDate: string;
  selectedTickets: Record<string, number>;
  customerDetails: any;
  onPaymentComplete: (paymentId: string) => void;
  onBack: () => void;
};

export default function PaymentForm({
  venue,
  selectedDate,
  selectedTickets,
  customerDetails,
  onPaymentComplete,
  onBack
}: PaymentFormProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  // Calculate total amount
  const calculateTotal = () => {
    return venue.ticketTypes.reduce((sum, ticketType) => {
      const quantity = selectedTickets[ticketType.id] || 0;
      return sum + (ticketType.price * quantity);
    }, 0);
  };

  const totalAmount = calculateTotal();
  
  // State for mock payment mode
  const [isMockPayment, setIsMockPayment] = useState(false);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  
  // Create payment intent on component mount
  useEffect(() => {
    const createPaymentIntent = async () => {
      try {
        setIsLoading(true);
        
        const response = await apiRequest("POST", "/api/create-payment-intent", {
          amount: totalAmount
        });
        
        const data = await response.json();
        setClientSecret(data.clientSecret);
        setPaymentIntentId(data.paymentIntentId);
        
        // Check if we're in mock payment mode
        if (data.mockPayment) {
          setIsMockPayment(true);
        }
      } catch (error: any) {
        toast({
          title: "Error",
          description: "Could not initialize payment. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    createPaymentIntent();
  }, [totalAmount, toast]);
  
  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Payment</h2>
      
      <div className="mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-1">
            <div className="flex justify-between">
              <span>Venue:</span>
              <span className="font-medium text-gray-800">{venue.name}</span>
            </div>
            <div className="flex justify-between">
              <span>Date:</span>
              <span className="font-medium text-gray-800">{selectedDate}</span>
            </div>
            {venue.ticketTypes.map(ticketType => {
              const quantity = selectedTickets[ticketType.id] || 0;
              if (quantity > 0) {
                return (
                  <div key={ticketType.id} className="flex justify-between">
                    <span>{ticketType.name} x {quantity}</span>
                    <span className="font-medium text-gray-800">
                      ₹{(ticketType.price * quantity).toFixed(2)}
                    </span>
                  </div>
                );
              }
              return null;
            })}
            <div className="border-t border-gray-200 mt-2 pt-2 flex justify-between font-medium">
              <span>Total:</span>
              <span className="text-primary">₹{totalAmount.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {isLoading ? (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-2">Initializing payment...</p>
        </div>
      ) : isMockPayment ? (
        // Show mock payment UI when Stripe is unavailable
        <div className="space-y-6">
          <div className="p-4 border border-blue-200 bg-blue-50 rounded-md">
            <h3 className="font-medium text-blue-800 mb-2">Test Payment Mode</h3>
            <p className="text-sm text-blue-700 mb-4">
              The payment gateway is in test mode. In a production environment, you would be connected to a real payment provider.
            </p>
            <div className="bg-white p-4 rounded border border-gray-200">
              <div className="mb-4 text-center">
                <span className="text-2xl font-bold text-primary">₹{totalAmount.toFixed(2)}</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Credit Card:</span>
                  <span>**** **** **** 1234</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Expiry:</span>
                  <span>12/25</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-between">
            <Button type="button" variant="outline" onClick={onBack}>
              Back
            </Button>
            <Button 
              onClick={() => {
                if (paymentIntentId) {
                  // Simulate payment success
                  apiRequest("POST", "/api/mock-payment-success", { paymentId: paymentIntentId })
                    .then(() => {
                      onPaymentComplete(paymentIntentId);
                    })
                    .catch(error => {
                      toast({
                        title: "Error",
                        description: "Failed to process test payment.",
                        variant: "destructive",
                      });
                    });
                }
              }} 
            >
              Pay ₹{totalAmount.toFixed(2)}
            </Button>
          </div>
        </div>
      ) : clientSecret ? (
        <Elements 
          stripe={stripePromise} 
          options={{ clientSecret, appearance: { theme: 'stripe' } }}
        >
          <CheckoutForm 
            onSuccess={onPaymentComplete} 
            onBack={onBack} 
            totalAmount={totalAmount}
          />
        </Elements>
      ) : (
        <div className="p-4 text-center">
          <p className="text-red-500">Could not initialize payment system. Please try again later.</p>
          <Button onClick={onBack} className="mt-4">
            Go Back
          </Button>
        </div>
      )}
    </div>
  );
}
