-- Create classroom sessions table
CREATE TABLE public.classroom_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
    recording_url TEXT DEFAULT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ DEFAULT NULL
);

-- Create classroom chat logs table
CREATE TABLE public.classroom_chat_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES public.classroom_sessions(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    sender_name TEXT NOT NULL,
    message_text TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on both tables
ALTER TABLE public.classroom_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classroom_chat_logs ENABLE ROW LEVEL SECURITY;

-- Helper to check if a user is a mentor, student, parent, or admin of a session
CREATE OR REPLACE FUNCTION public.can_access_session(session_id UUID)
RETURNS BOOLEAN SECURITY DEFINER AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.classroom_sessions s
        JOIN public.classes c ON c.id = s.class_id
        WHERE s.id = session_id AND (
            c.student_id = auth.uid() OR
            c.mentor_id = auth.uid() OR
            public.is_admin() OR
            EXISTS (
                SELECT 1 FROM public.parent_student ps
                WHERE ps.parent_id = auth.uid() AND ps.student_id = c.student_id
            )
        )
    );
END;
$$ LANGUAGE plpgsql;

-- Policies for classroom_sessions
CREATE POLICY "Allow read sessions"
    ON public.classroom_sessions FOR SELECT TO authenticated
    USING (public.can_access_session(id));

CREATE POLICY "Allow insert sessions"
    ON public.classroom_sessions FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.classes c
            WHERE c.id = class_id AND (c.student_id = auth.uid() OR c.mentor_id = auth.uid() OR public.is_admin())
        )
    );

CREATE POLICY "Allow update sessions"
    ON public.classroom_sessions FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.classes c
            WHERE c.id = class_id AND (c.mentor_id = auth.uid() OR public.is_admin())
        )
    );

-- Policies for classroom_chat_logs
CREATE POLICY "Allow read chat logs"
    ON public.classroom_chat_logs FOR SELECT TO authenticated
    USING (public.can_access_session(session_id));

CREATE POLICY "Allow insert chat logs"
    ON public.classroom_chat_logs FOR INSERT TO authenticated
    WITH CHECK (
        public.can_access_session(session_id) AND sender_id = auth.uid()
    );
