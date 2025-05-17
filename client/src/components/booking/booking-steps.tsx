import { CalendarIcon, CheckCircle, CreditCard, User, Ticket } from "lucide-react";

type BookingStepsProps = {
  currentStep: number;
};

export default function BookingSteps({ currentStep }: BookingStepsProps) {
  const steps = [
    { id: 1, name: "Tickets", icon: Ticket },
    { id: 2, name: "Date", icon: CalendarIcon },
    { id: 3, name: "Details", icon: User },
    { id: 4, name: "Payment", icon: CreditCard },
    { id: 5, name: "Confirmed", icon: CheckCircle },
  ];
  
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between max-w-3xl mx-auto">
        {steps.map((step, index) => (
          <div key={step.id} className="flex flex-col items-center">
            <div 
              className={`w-10 h-10 flex items-center justify-center rounded-full ${
                currentStep >= step.id
                  ? "bg-primary text-white"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              <step.icon className="h-5 w-5" />
            </div>
            <div 
              className={`mt-2 text-sm font-medium ${
                currentStep >= step.id ? "text-primary" : "text-gray-500"
              }`}
            >
              {step.name}
            </div>
            
            {/* Connector line */}
            {index < steps.length - 1 && (
              <div 
                className={`hidden sm:block absolute left-0 right-0 h-0.5 -translate-y-5 mx-16 ${
                  currentStep > step.id ? "bg-primary" : "bg-gray-200"
                }`}
                style={{ 
                  width: `${100 / (steps.length - 1)}%`, 
                  left: `${(index * 100) / (steps.length - 1) + 100 / (steps.length * 2)}%` 
                }}
              ></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
