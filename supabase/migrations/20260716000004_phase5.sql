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
