-- Beetorial Unified Database Schema
-- Combined on 2026-07-18T04:31:13.741109Z
-- Consolidates all migrations (Phase 0 to Phase 7)


-- ==========================================
-- MIGRATION: 20260716000000_init.sql
-- ==========================================

-- Create user role enum
CREATE TYPE public.user_role AS ENUM ('student', 'parent', 'mentor', 'admin');

-- Create profiles table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role public.user_role NOT NULL DEFAULT 'student',
    full_name TEXT DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Helper function to check if the current user is an admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN SECURITY DEFINER AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql;

-- Policies for profiles
CREATE POLICY "Allow users to read their own profile"
    ON public.profiles
    FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

CREATE POLICY "Allow admins to read all profiles"
    ON public.profiles
    FOR SELECT
    TO authenticated
    USING (public.is_admin());

CREATE POLICY "Allow users to update their own profile"
    ON public.profiles
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Allow admins to update all profiles"
    ON public.profiles
    FOR UPDATE
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- Trigger function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER SECURITY DEFINER AS $$
DECLARE
    user_role public.user_role;
BEGIN
    -- Cast role from user metadata, default to 'student' if invalid or missing
    BEGIN
        user_role := COALESCE(
            (new.raw_user_meta_data->>'role')::public.user_role,
            'student'::public.user_role
        );
    EXCEPTION WHEN OTHERS THEN
        user_role := 'student'::public.user_role;
    END;

    INSERT INTO public.profiles (id, email, role, full_name)
    VALUES (
        new.id,
        new.email,
        user_role,
        COALESCE(new.raw_user_meta_data->>'full_name', '')
    );
    RETURN new;
END;
$$ LANGUAGE plpgsql;

-- Trigger to sync auth users with public profiles
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();



-- ==========================================
-- MIGRATION: 20260716000001_phase1.sql
-- ==========================================

-- Create parent-student relationship mapping table
CREATE TABLE public.parent_student (
    parent_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    PRIMARY KEY (parent_id, student_id)
);

-- Create subjects table
CREATE TABLE public.subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create chapters table
CREATE TABLE public.chapters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    order_index INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create topics table
CREATE TABLE public.topics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chapter_id UUID REFERENCES public.chapters(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    order_index INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create notes table
CREATE TABLE public.notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    topic_id UUID REFERENCES public.topics(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create assignments table
CREATE TABLE public.assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    due_date TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'submitted', 'graded')),
    xp_reward INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create classes table
CREATE TABLE public.classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    mentor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    subject TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('scheduled', 'completed', 'missed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create student progress stats table
CREATE TABLE public.student_progress (
    student_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    accuracy_percentage INT NOT NULL DEFAULT 0,
    streak_days INT NOT NULL DEFAULT 0,
    xp INT NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.parent_student ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_progress ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is mentor or admin
CREATE OR REPLACE FUNCTION public.is_mentor_or_admin()
RETURNS BOOLEAN SECURITY DEFINER AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role IN ('mentor', 'admin')
    );
END;
$$ LANGUAGE plpgsql;

-- Policies for parent_student
CREATE POLICY "Allow read parent_student"
    ON public.parent_student FOR SELECT TO authenticated
    USING (auth.uid() = parent_id OR auth.uid() = student_id OR public.is_mentor_or_admin());

-- Policies for subjects, chapters, topics, notes (anyone authenticated can read)
CREATE POLICY "Allow read subjects" ON public.subjects FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read chapters" ON public.chapters FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read topics" ON public.topics FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read notes" ON public.notes FOR SELECT TO authenticated USING (true);

-- Policies for assignments
CREATE POLICY "Allow student read own assignments"
    ON public.assignments FOR SELECT TO authenticated
    USING (auth.uid() = student_id OR public.is_mentor_or_admin() OR EXISTS (
        SELECT 1 FROM public.parent_student
        WHERE parent_id = auth.uid() AND student_id = assignments.student_id
    ));

-- Policies for classes
CREATE POLICY "Allow read classes"
    ON public.classes FOR SELECT TO authenticated
    USING (auth.uid() = student_id OR auth.uid() = mentor_id OR public.is_mentor_or_admin() OR EXISTS (
        SELECT 1 FROM public.parent_student
        WHERE parent_id = auth.uid() AND student_id = classes.student_id
    ));

-- Policies for student_progress
CREATE POLICY "Allow read student_progress"
    ON public.student_progress FOR SELECT TO authenticated
    USING (auth.uid() = student_id OR public.is_mentor_or_admin() OR EXISTS (
        SELECT 1 FROM public.parent_student
        WHERE parent_id = auth.uid() AND student_id = student_progress.student_id
    ));



-- ==========================================
-- MIGRATION: 20260716000002_phase2.sql
-- ==========================================

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



-- ==========================================
-- MIGRATION: 20260716000003_phase3.sql
-- ==========================================

-- Create assessments table
CREATE TABLE public.assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    time_limit_mins INT NOT NULL DEFAULT 30,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create questions table
CREATE TABLE public.questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID REFERENCES public.assessments(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('mcq', 'fill_blank', 'match_pairs', 'puzzle', 'image_based', 'short_answer')),
    question_text TEXT NOT NULL,
    options JSONB DEFAULT NULL,
    correct_answer TEXT NOT NULL,
    topic_id UUID REFERENCES public.topics(id) ON DELETE CASCADE,
    order_index INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create assessment attempts table
CREATE TABLE public.assessment_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID REFERENCES public.assessments(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    score INT DEFAULT NULL,
    status TEXT NOT NULL CHECK (status IN ('started', 'submitted', 'graded')),
    violations_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create assessment answers table
CREATE TABLE public.assessment_answers (
    attempt_id UUID REFERENCES public.assessment_attempts(id) ON DELETE CASCADE,
    question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE,
    student_answer TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL DEFAULT FALSE,
    PRIMARY KEY (attempt_id, question_id)
);

-- Create proctoring violations table
CREATE TABLE public.proctoring_violations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attempt_id UUID REFERENCES public.assessment_attempts(id) ON DELETE CASCADE,
    violation_type TEXT NOT NULL CHECK (violation_type IN ('face_missing', 'multiple_faces', 'tab_switch', 'fullscreen_exit')),
    logged_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    details TEXT DEFAULT ''
);

-- Create revision packs table
CREATE TABLE public.revision_packs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    topic_id UUID REFERENCES public.topics(id) ON DELETE CASCADE,
    source_assessment_id UUID REFERENCES public.assessments(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proctoring_violations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revision_packs ENABLE ROW LEVEL SECURITY;

-- Helper check function for student/mentor access to attempts
CREATE OR REPLACE FUNCTION public.can_access_attempt(attempt_id UUID)
RETURNS BOOLEAN SECURITY DEFINER AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.assessment_attempts a
        WHERE a.id = attempt_id AND (
            a.student_id = auth.uid() OR
            public.is_mentor_or_admin() OR
            EXISTS (
                SELECT 1 FROM public.parent_student ps
                WHERE ps.parent_id = auth.uid() AND ps.student_id = a.student_id
            )
        )
    );
END;
$$ LANGUAGE plpgsql;

-- Policies for assessments and questions (read for authenticated)
CREATE POLICY "Allow read assessments" ON public.assessments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read questions" ON public.questions FOR SELECT TO authenticated USING (true);

-- Policies for assessment_attempts
CREATE POLICY "Allow read attempts"
    ON public.assessment_attempts FOR SELECT TO authenticated
    USING (
        student_id = auth.uid() OR 
        public.is_mentor_or_admin() OR 
        EXISTS (
            SELECT 1 FROM public.parent_student ps
            WHERE ps.parent_id = auth.uid() AND ps.student_id = assessment_attempts.student_id
        )
    );

CREATE POLICY "Allow insert attempts"
    ON public.assessment_attempts FOR INSERT TO authenticated
    WITH CHECK (student_id = auth.uid() OR public.is_mentor_or_admin());

CREATE POLICY "Allow update attempts"
    ON public.assessment_attempts FOR UPDATE TO authenticated
    USING (student_id = auth.uid() OR public.is_mentor_or_admin());

-- Policies for assessment_answers
CREATE POLICY "Allow select answers"
    ON public.assessment_answers FOR SELECT TO authenticated
    USING (public.can_access_attempt(attempt_id));

CREATE POLICY "Allow insert answers"
    ON public.assessment_answers FOR INSERT TO authenticated
    WITH CHECK (public.can_access_attempt(attempt_id));

-- Policies for proctoring_violations
CREATE POLICY "Allow select violations"
    ON public.proctoring_violations FOR SELECT TO authenticated
    USING (public.can_access_attempt(attempt_id));

CREATE POLICY "Allow insert violations"
    ON public.proctoring_violations FOR INSERT TO authenticated
    WITH CHECK (public.can_access_attempt(attempt_id));

-- Policies for revision_packs
CREATE POLICY "Allow select revision_packs"
    ON public.revision_packs FOR SELECT TO authenticated
    USING (
        student_id = auth.uid() OR 
        public.is_mentor_or_admin() OR 
        EXISTS (
            SELECT 1 FROM public.parent_student ps
            WHERE ps.parent_id = auth.uid() AND ps.student_id = revision_packs.student_id
        )
    );

CREATE POLICY "Allow insert revision_packs"
    ON public.revision_packs FOR INSERT TO authenticated
    WITH CHECK (student_id = auth.uid() OR public.is_mentor_or_admin());



-- ==========================================
-- MIGRATION: 20260716000004_phase5.sql
-- ==========================================

-- Create mentor_availability table
CREATE TABLE IF NOT EXISTS public.mentor_availability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mentor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('available', 'booked')) DEFAULT 'available',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS for mentor_availability
ALTER TABLE public.mentor_availability ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated read availability"
    ON public.mentor_availability FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Allow mentors to manage availability"
    ON public.mentor_availability FOR ALL
    TO authenticated
    USING (mentor_id = auth.uid())
    WITH CHECK (mentor_id = auth.uid());

-- Create shared_notepad table
CREATE TABLE IF NOT EXISTS public.shared_notepad (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    mentor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL DEFAULT '',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS for shared_notepad
ALTER TABLE public.shared_notepad ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow users to read linked notepad"
    ON public.shared_notepad FOR SELECT
    TO authenticated
    USING (student_id = auth.uid() OR mentor_id = auth.uid() OR EXISTS (
        SELECT 1 FROM public.parent_student
        WHERE parent_id = auth.uid() AND student_id = shared_notepad.student_id
    ));

CREATE POLICY "Allow students and mentors to edit notepad"
    ON public.shared_notepad FOR ALL
    TO authenticated
    USING (student_id = auth.uid() OR mentor_id = auth.uid())
    WITH CHECK (student_id = auth.uid() OR mentor_id = auth.uid());

-- Create uploaded_files table
CREATE TABLE IF NOT EXISTS public.uploaded_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    mentor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    file_url TEXT NOT NULL,
    subject TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS for uploaded_files
ALTER TABLE public.uploaded_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow users to view shared uploads"
    ON public.uploaded_files FOR SELECT
    TO authenticated
    USING (student_id = auth.uid() OR mentor_id = auth.uid() OR EXISTS (
        SELECT 1 FROM public.parent_student
        WHERE parent_id = auth.uid() AND student_id = uploaded_files.student_id
    ));

CREATE POLICY "Allow mentors to upload shared files"
    ON public.uploaded_files FOR ALL
    TO authenticated
    USING (mentor_id = auth.uid())
    WITH CHECK (mentor_id = auth.uid());



-- ==========================================
-- MIGRATION: 20260716000005_phase6_crm.sql
-- ==========================================

-- Create leads table
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_name TEXT NOT NULL,
    parent_name TEXT NOT NULL,
    parent_email TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('demo_requested', 'demo_scheduled', 'enrolled', 'paid')) DEFAULT 'demo_requested',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS for leads
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow admin full access to leads"
    ON public.leads FOR ALL
    TO authenticated
    USING (EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    ))
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    ));

-- Create invoices table
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount NUMERIC(10,2) NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('paid', 'pending', 'overdue')) DEFAULT 'pending',
    due_date DATE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS for invoices
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow admin full access to invoices"
    ON public.invoices FOR ALL
    TO authenticated
    USING (EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    ))
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    ));

-- Create student_mentor_links table
CREATE TABLE IF NOT EXISTS public.student_mentor_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    mentor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(student_id, mentor_id)
);

-- Enable RLS for student_mentor_links
ALTER TABLE public.student_mentor_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow admin full access to student_mentor_links"
    ON public.student_mentor_links FOR ALL
    TO authenticated
    USING (EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    ))
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    ));

CREATE POLICY "Allow users to read assigned student_mentor_links"
    ON public.student_mentor_links FOR SELECT
    TO authenticated
    USING (student_id = auth.uid() OR mentor_id = auth.uid());



-- ==========================================
-- MIGRATION: 20260716000006_phase7_notifications.sql
-- ==========================================

-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS for notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow users to manage their own notifications"
    ON public.notifications FOR ALL
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Allow mentors and admins to insert notifications"
    ON public.notifications FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND (role = 'mentor' OR role = 'admin')
        )
    );


