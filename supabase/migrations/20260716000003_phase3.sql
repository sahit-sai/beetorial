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
