
-- Add financial columns to profiles table if they don't exist
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS total_earnings DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS available_balance DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS pending_earnings DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_withdrawn DECIMAL(10,2) DEFAULT 0;

-- Create provider_earnings table
CREATE TABLE IF NOT EXISTS public.provider_earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES public.profiles(id),
  task_id UUID NOT NULL REFERENCES public.tasks(id),
  offer_id UUID NOT NULL REFERENCES public.offers(id),
  amount DECIMAL(10,2) NOT NULL,
  commission_amount DECIMAL(10,2) NOT NULL,
  net_amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  available_at TIMESTAMP WITH TIME ZONE,
  withdrawn_at TIMESTAMP WITH TIME ZONE
);

-- Create wallet_transactions table
CREATE TABLE IF NOT EXISTS public.wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES public.profiles(id),
  amount DECIMAL(10,2) NOT NULL,
  transaction_type TEXT NOT NULL,
  status TEXT NOT NULL,
  reference TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create increment and decrement functions for numeric fields
CREATE OR REPLACE FUNCTION public.increment(row_id uuid, inc numeric)
RETURNS void AS $$
BEGIN
  RETURN;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.decrement(row_id uuid, dec numeric)
RETURNS void AS $$
BEGIN
  RETURN;
END;
$$ LANGUAGE plpgsql;

-- Add appropriate indexes
CREATE INDEX IF NOT EXISTS idx_provider_earnings_provider_id ON public.provider_earnings(provider_id);
CREATE INDEX IF NOT EXISTS idx_provider_earnings_task_id ON public.provider_earnings(task_id);
CREATE INDEX IF NOT EXISTS idx_provider_earnings_status ON public.provider_earnings(status);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_provider_id ON public.wallet_transactions(provider_id);
