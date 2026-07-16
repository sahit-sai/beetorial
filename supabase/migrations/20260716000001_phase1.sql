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
