-- Track user state in the Messenger conversation
CREATE TABLE IF NOT EXISTS public.user_states (
    psid TEXT PRIMARY KEY, -- Page-Scoped User ID
    current_step TEXT NOT NULL DEFAULT 'greeting',
    is_human_managed BOOLEAN NOT NULL DEFAULT false,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Store final lead information
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    psid TEXT REFERENCES public.user_states(psid),
    full_name TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    project_scope TEXT, -- (e.g., 'basic_website')
    page_count TEXT,    -- (e.g., '1-5')
    timeline TEXT,      -- (e.g., 'asap')
    booking_id TEXT,    -- Google Calendar Event ID
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS (Row Level Security)
-- For a chatbot, usually the Edge Function has service-level access, 
-- but we should enable RLS to safe-guard against direct public access.
ALTER TABLE public.user_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Helper function to update updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER tr_user_states_updated_at
    BEFORE UPDATE ON public.user_states
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();
