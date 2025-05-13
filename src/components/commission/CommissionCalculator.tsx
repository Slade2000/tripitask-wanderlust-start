
import { useEffect, useState } from "react";
import { calculateCommission } from "@/services/admin/adminSettings";

interface CommissionCalculatorProps {
  amount: number;
  isProvider?: boolean;
  onCalculated?: (data: { 
    commission: number; 
    total: number; 
    netAmount: number 
  }) => void;
}

export default function CommissionCalculator({ 
  amount, 
  isProvider = false,
  onCalculated
}: CommissionCalculatorProps) {
  const [commission, setCommission] = useState(0);
  const [total, setTotal] = useState(0);
  const [netAmount, setNetAmount] = useState(0);
  const [calculationDone, setCalculationDone] = useState(false);

  useEffect(() => {
    if (amount > 0) {
      const fetchCommission = async () => {
        const result = await calculateCommission(amount);
        setCommission(result.commission);
        setTotal(result.total);
        setNetAmount(result.netAmount);
        setCalculationDone(true);

        if (onCalculated) {
          onCalculated(result);
        }
      };

      fetchCommission();
    } else {
      setCommission(0);
      setTotal(0);
      setNetAmount(0);
      setCalculationDone(false);
    }
  }, [amount, onCalculated]);

  if (!calculationDone || amount <= 0) {
    return null;
  }

  if (isProvider) {
    // For providers, show what they'll receive after commission
    return (
      <div className="text-sm text-gray-500 mt-1">
        <p>
          After {(commission / amount * 100).toFixed(1)}% commission, you'll receive ${netAmount.toFixed(2)}.
        </p>
      </div>
    );
  } else {
    // For task posters, show the total cost including commission
    return (
      <div className="text-sm text-gray-500 mt-1">
        <p>
          Total including {(commission / amount * 100).toFixed(1)}% commission: ${total.toFixed(2)}
        </p>
      </div>
    );
  }
}
