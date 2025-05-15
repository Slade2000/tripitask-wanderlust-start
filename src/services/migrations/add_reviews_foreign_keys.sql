
-- Add foreign key constraints to reviews table
ALTER TABLE public.reviews
ADD CONSTRAINT fk_reviewer
FOREIGN KEY (reviewer_id) REFERENCES public.profiles (id);

ALTER TABLE public.reviews
ADD CONSTRAINT fk_reviewee
FOREIGN KEY (reviewee_id) REFERENCES public.profiles (id);

-- Add additional constraint to link reviews to tasks
ALTER TABLE public.reviews
ADD CONSTRAINT fk_review_task
FOREIGN KEY (task_id) REFERENCES public.tasks (id);
