-- Add Parent ID for Category Hierarchy
ALTER TABLE categories ADD COLUMN parent_id UUID REFERENCES categories(id) ON DELETE CASCADE;

-- Add Budget Type to explicitly map Main Categories for AI and 50/30/20 Rule
-- Expected values for Main Categories: 'needs', 'wants', 'savings', 'income'
-- Or inherited by their children.
ALTER TABLE categories ADD COLUMN budget_type TEXT;

-- We don't need any new RLS policies since 'categories' already has full CRUD policies mapped to user_id.
