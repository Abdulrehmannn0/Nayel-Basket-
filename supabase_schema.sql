-- ==========================================================
-- NAYEL BASKET - SUPABASE POSTGRESQL DATABASE SCHEMAS & MIGRATIONS
-- ==========================================================
-- This file contains the complete SQL schemas, storage configuration,
-- and Row-Level Security (RLS) policies for both the Customer App and
-- the Admin Dashboard.
-- Use this script in the Supabase SQL Editor to initialize your database.

-- Enable UUID extension for unique primary keys
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================================
-- updated_at Trigger Function
-- ==========================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ==========================================================
-- 1. USERS & PROFILES TABLE
-- ==========================================================
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY, -- Links directly to auth.users.id
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    phone TEXT,
    role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin', 'manager', 'curator')),
    avatar_url TEXT,
    referral_code TEXT UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

-- ==========================================================
-- 2. ADMINS DETAILS TABLE (Strict Admin Role Verification)
-- ==========================================================
CREATE TABLE IF NOT EXISTS public.admins (
    id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
    permissions TEXT[] DEFAULT '{"all"}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ==========================================================
-- 3. BRANDS TABLE
-- ==========================================================
CREATE TABLE IF NOT EXISTS public.brands (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    logo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ==========================================================
-- 4. CATEGORIES TABLE
-- ==========================================================
CREATE TABLE IF NOT EXISTS public.categories (
    id TEXT PRIMARY KEY, -- e.g. "Furniture", "Lighting", etc.
    name TEXT NOT NULL UNIQUE,
    slug TEXT UNIQUE NOT NULL,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==========================================================
-- 5. SUB-CATEGORIES TABLE
-- ==========================================================
CREATE TABLE IF NOT EXISTS public.sub_categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    category_id TEXT REFERENCES public.categories(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(category_id, name)
);

-- ==========================================================
-- 6. COLLECTIONS TABLE
-- ==========================================================
CREATE TABLE IF NOT EXISTS public.collections (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    slug TEXT UNIQUE NOT NULL,
    image_url TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ==========================================================
-- 7. PRODUCTS TABLE
-- ==========================================================
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY, -- e.g. "prod_1" or "prod_xxxx"
    name TEXT NOT NULL,
    brand TEXT NOT NULL,
    brand_id UUID REFERENCES public.brands(id) ON DELETE SET NULL,
    price NUMERIC NOT NULL CHECK (price >= 0),
    original_price NUMERIC CHECK (original_price >= 0),
    image TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT 'Premium hand-selected decor selection.',
    category TEXT NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
    rating NUMERIC DEFAULT 4.5,
    review_count INTEGER DEFAULT 12,
    stock_count INTEGER DEFAULT 10,
    seller_id TEXT DEFAULT 'nayel-curator',
    seller_name TEXT DEFAULT 'Nayel Basket Elite',
    features TEXT[] DEFAULT '{}',
    sizes TEXT[] DEFAULT '{"S", "M", "L", "XL"}',
    colors TEXT[] DEFAULT '{"Midnight Matte", "Core Black", "Silver Grey"}',
    sku TEXT UNIQUE,
    tags TEXT[] DEFAULT '{"Decor", "Premium"}',
    gallery TEXT[] DEFAULT '{}',
    collection_id UUID REFERENCES public.collections(id) ON DELETE SET NULL,
    is_trending BOOLEAN DEFAULT false,
    is_bestseller BOOLEAN DEFAULT false,
    is_new_arrival BOOLEAN DEFAULT false,
    is_editors_choice BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_name ON public.products(name);
CREATE INDEX IF NOT EXISTS idx_products_sku ON public.products(sku);

-- ==========================================================
-- 8. PRODUCT IMAGES TABLE
-- ==========================================================
CREATE TABLE IF NOT EXISTS public.product_images (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    product_id TEXT REFERENCES public.products(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ==========================================================
-- 9. PRODUCT VIDEOS TABLE
-- ==========================================================
CREATE TABLE IF NOT EXISTS public.product_videos (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    product_id TEXT REFERENCES public.products(id) ON DELETE CASCADE,
    video_url TEXT NOT NULL,
    thumbnail_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ==========================================================
-- 10. COUPONS TABLE
-- ==========================================================
CREATE TABLE IF NOT EXISTS public.coupons (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('percentage', 'fixed')),
    value NUMERIC NOT NULL CHECK (value > 0),
    min_spend NUMERIC DEFAULT 0,
    expiry_date TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ==========================================================
-- 11. ORDERS TABLE
-- ==========================================================
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY, -- e.g. "NB-XXXXXX"
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    subtotal NUMERIC NOT NULL CHECK (subtotal >= 0),
    discount NUMERIC DEFAULT 0 CHECK (discount >= 0),
    tax NUMERIC NOT NULL CHECK (tax >= 0),
    total NUMERIC NOT NULL CHECK (total >= 0),
    status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Processing', 'Dispatched', 'Delivered', 'Cancelled', 'Returned')),
    payment_method TEXT DEFAULT 'Card',
    shipping_address JSONB NOT NULL DEFAULT '{}'::jsonb,
    tracking JSONB NOT NULL DEFAULT '[]'::jsonb,
    otp TEXT NOT NULL,
    reward_points_earned INTEGER DEFAULT 0,
    items JSONB NOT NULL DEFAULT '[]'::jsonb, -- Cache of ordered items for integrity
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);

-- ==========================================================
-- 12. ORDER ITEMS TABLE
-- ==========================================================
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_id TEXT REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id TEXT REFERENCES public.products(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price NUMERIC NOT NULL CHECK (price >= 0),
    selected_size TEXT,
    selected_color TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ==========================================================
-- 13. CART TABLE
-- ==========================================================
CREATE TABLE IF NOT EXISTS public.cart (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    selected_size TEXT,
    selected_color TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(user_id, product_id, selected_size, selected_color)
);

CREATE TRIGGER update_cart_updated_at BEFORE UPDATE ON public.cart 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==========================================================
-- 14. WISHLIST TABLE
-- ==========================================================
CREATE TABLE IF NOT EXISTS public.wishlist (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(user_id, product_id)
);

-- ==========================================================
-- 15. ADDRESSES TABLE
-- ==========================================================
CREATE TABLE IF NOT EXISTS public.addresses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    street TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    zip TEXT NOT NULL,
    phone TEXT NOT NULL,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TRIGGER update_addresses_updated_at BEFORE UPDATE ON public.addresses 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==========================================================
-- 16. REVIEWS & RATINGS TABLE
-- ==========================================================
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    product_id TEXT REFERENCES public.products(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    user_name TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    likes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON public.reviews(product_id);

CREATE TABLE IF NOT EXISTS public.ratings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    product_id TEXT REFERENCES public.products(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    rating NUMERIC NOT NULL CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(product_id, user_id)
);

-- ==========================================================
-- 17. WALLET TABLE
-- ==========================================================
CREATE TABLE IF NOT EXISTS public.wallet (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    balance NUMERIC NOT NULL DEFAULT 0.00 CHECK (balance >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TRIGGER update_wallet_updated_at BEFORE UPDATE ON public.wallet 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==========================================================
-- 18. REWARD POINTS TABLE
-- ==========================================================
CREATE TABLE IF NOT EXISTS public.reward_points (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    points INTEGER NOT NULL DEFAULT 0 CHECK (points >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TRIGGER update_reward_points_updated_at BEFORE UPDATE ON public.reward_points 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==========================================================
-- 19. REFERRALS TABLE
-- ==========================================================
CREATE TABLE IF NOT EXISTS public.referrals (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    referrer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    referred_user_id UUID UNIQUE REFERENCES public.users(id) ON DELETE SET NULL,
    referral_code TEXT NOT NULL,
    is_completed BOOLEAN DEFAULT false,
    reward_awarded INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ==========================================================
-- 20. NOTIFICATIONS TABLE
-- ==========================================================
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'system', -- 'system', 'order', 'promo'
    read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);

-- ==========================================================
-- 21. BANNERS TABLE
-- ==========================================================
CREATE TABLE IF NOT EXISTS public.banners (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    subtitle TEXT,
    image_url TEXT NOT NULL,
    link_url TEXT,
    position INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ==========================================================
-- 22. HOMEPAGE SECTIONS TABLE
-- ==========================================================
CREATE TABLE IF NOT EXISTS public.homepage_sections (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    section_type TEXT NOT NULL, -- 'hero', 'carousel', 'grid', 'bento'
    content_data JSONB DEFAULT '{}'::jsonb,
    sort_order INTEGER DEFAULT 0,
    is_visible BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ==========================================================
-- 23. VIDEOS TABLE (Bespoke Video Shopping)
-- ==========================================================
CREATE TABLE IF NOT EXISTS public.videos (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    video_url TEXT NOT NULL,
    thumbnail_url TEXT,
    likes_count INTEGER DEFAULT 0,
    views_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ==========================================================
-- 24. TESTIMONIALS TABLE
-- ==========================================================
CREATE TABLE IF NOT EXISTS public.testimonials (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_name TEXT NOT NULL,
    avatar_url TEXT,
    comment TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    designation TEXT,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ==========================================================
-- 25. BLOGS TABLE
-- ==========================================================
CREATE TABLE IF NOT EXISTS public.blogs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    image_url TEXT NOT NULL,
    author_name TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TRIGGER update_blogs_updated_at BEFORE UPDATE ON public.blogs 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==========================================================
-- 26. SETTINGS TABLE
-- ==========================================================
CREATE TABLE IF NOT EXISTS public.settings (
    key TEXT PRIMARY KEY,
    value JSONB DEFAULT '{}'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ==========================================================
-- 27. FAQ TABLE
-- ==========================================================
CREATE TABLE IF NOT EXISTS public.faq (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ==========================================================
-- 28. CONTACT MESSAGES TABLE
-- ==========================================================
CREATE TABLE IF NOT EXISTS public.contact_messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'responded')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ==========================================================
-- 29. SHIPPING METHODS TABLE
-- ==========================================================
CREATE TABLE IF NOT EXISTS public.shipping_methods (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    price NUMERIC NOT NULL CHECK (price >= 0),
    estimated_days TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ==========================================================
-- 30. RETURNS & REFUNDS TABLE
-- ==========================================================
CREATE TABLE IF NOT EXISTS public.returns (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_id TEXT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    details TEXT,
    status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected', 'Completed')),
    refund_amount NUMERIC NOT NULL CHECK (refund_amount >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TRIGGER update_returns_updated_at BEFORE UPDATE ON public.returns 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.refunds (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    return_id UUID REFERENCES public.returns(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL CHECK (amount >= 0),
    status TEXT NOT NULL DEFAULT 'Processing' CHECK (status IN ('Processing', 'Completed', 'Failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ==========================================================
-- 31. ANALYTICS EVENTS TABLE
-- ==========================================================
CREATE TABLE IF NOT EXISTS public.analytics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    event_name TEXT NOT NULL,
    params JSONB DEFAULT '{}'::jsonb,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_analytics_event ON public.analytics(event_name);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON public.analytics(created_at DESC);

-- ==========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES ON ALL TABLES
-- ==========================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sub_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reward_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homepage_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faq ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipping_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.returns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics ENABLE ROW LEVEL SECURITY;

-- 1. General Admin/Staff Access (Super administrators bypass)
-- Users with admin or curator roles can perform anything on any table
CREATE POLICY "Admin All Access on users" ON public.users FOR ALL USING (auth.uid() IN (SELECT id FROM public.users WHERE role IN ('admin', 'manager')));
CREATE POLICY "Admin All Access on admins" ON public.admins FOR ALL USING (auth.uid() IN (SELECT id FROM public.users WHERE role = 'admin'));
CREATE POLICY "Admin All Access on brands" ON public.brands FOR ALL USING (auth.uid() IN (SELECT id FROM public.users WHERE role IN ('admin', 'manager')));
CREATE POLICY "Admin All Access on categories" ON public.categories FOR ALL USING (auth.uid() IN (SELECT id FROM public.users WHERE role IN ('admin', 'manager')));
CREATE POLICY "Admin All Access on sub_categories" ON public.sub_categories FOR ALL USING (auth.uid() IN (SELECT id FROM public.users WHERE role IN ('admin', 'manager')));
CREATE POLICY "Admin All Access on collections" ON public.collections FOR ALL USING (auth.uid() IN (SELECT id FROM public.users WHERE role IN ('admin', 'manager')));
CREATE POLICY "Admin All Access on products" ON public.products FOR ALL USING (auth.uid() IN (SELECT id FROM public.users WHERE role IN ('admin', 'manager', 'curator')));
CREATE POLICY "Admin All Access on product_images" ON public.product_images FOR ALL USING (auth.uid() IN (SELECT id FROM public.users WHERE role IN ('admin', 'manager', 'curator')));
CREATE POLICY "Admin All Access on product_videos" ON public.product_videos FOR ALL USING (auth.uid() IN (SELECT id FROM public.users WHERE role IN ('admin', 'manager', 'curator')));
CREATE POLICY "Admin All Access on coupons" ON public.coupons FOR ALL USING (auth.uid() IN (SELECT id FROM public.users WHERE role IN ('admin', 'manager')));
CREATE POLICY "Admin All Access on orders" ON public.orders FOR ALL USING (auth.uid() IN (SELECT id FROM public.users WHERE role IN ('admin', 'manager')));
CREATE POLICY "Admin All Access on order_items" ON public.order_items FOR ALL USING (auth.uid() IN (SELECT id FROM public.users WHERE role IN ('admin', 'manager')));
CREATE POLICY "Admin All Access on cart" ON public.cart FOR ALL USING (auth.uid() IN (SELECT id FROM public.users WHERE role IN ('admin', 'manager')));
CREATE POLICY "Admin All Access on wishlist" ON public.wishlist FOR ALL USING (auth.uid() IN (SELECT id FROM public.users WHERE role IN ('admin', 'manager')));
CREATE POLICY "Admin All Access on addresses" ON public.addresses FOR ALL USING (auth.uid() IN (SELECT id FROM public.users WHERE role IN ('admin', 'manager')));
CREATE POLICY "Admin All Access on reviews" ON public.reviews FOR ALL USING (auth.uid() IN (SELECT id FROM public.users WHERE role IN ('admin', 'manager')));
CREATE POLICY "Admin All Access on ratings" ON public.ratings FOR ALL USING (auth.uid() IN (SELECT id FROM public.users WHERE role IN ('admin', 'manager')));
CREATE POLICY "Admin All Access on wallet" ON public.wallet FOR ALL USING (auth.uid() IN (SELECT id FROM public.users WHERE role IN ('admin', 'manager')));
CREATE POLICY "Admin All Access on reward_points" ON public.reward_points FOR ALL USING (auth.uid() IN (SELECT id FROM public.users WHERE role IN ('admin', 'manager')));
CREATE POLICY "Admin All Access on referrals" ON public.referrals FOR ALL USING (auth.uid() IN (SELECT id FROM public.users WHERE role IN ('admin', 'manager')));
CREATE POLICY "Admin All Access on notifications" ON public.notifications FOR ALL USING (auth.uid() IN (SELECT id FROM public.users WHERE role IN ('admin', 'manager')));
CREATE POLICY "Admin All Access on banners" ON public.banners FOR ALL USING (auth.uid() IN (SELECT id FROM public.users WHERE role IN ('admin', 'manager')));
CREATE POLICY "Admin All Access on homepage_sections" ON public.homepage_sections FOR ALL USING (auth.uid() IN (SELECT id FROM public.users WHERE role IN ('admin', 'manager')));
CREATE POLICY "Admin All Access on videos" ON public.videos FOR ALL USING (auth.uid() IN (SELECT id FROM public.users WHERE role IN ('admin', 'manager', 'curator')));
CREATE POLICY "Admin All Access on testimonials" ON public.testimonials FOR ALL USING (auth.uid() IN (SELECT id FROM public.users WHERE role IN ('admin', 'manager')));
CREATE POLICY "Admin All Access on blogs" ON public.blogs FOR ALL USING (auth.uid() IN (SELECT id FROM public.users WHERE role IN ('admin', 'manager', 'curator')));
CREATE POLICY "Admin All Access on settings" ON public.settings FOR ALL USING (auth.uid() IN (SELECT id FROM public.users WHERE role = 'admin'));
CREATE POLICY "Admin All Access on faq" ON public.faq FOR ALL USING (auth.uid() IN (SELECT id FROM public.users WHERE role IN ('admin', 'manager')));
CREATE POLICY "Admin All Access on contact_messages" ON public.contact_messages FOR ALL USING (auth.uid() IN (SELECT id FROM public.users WHERE role IN ('admin', 'manager')));
CREATE POLICY "Admin All Access on shipping_methods" ON public.shipping_methods FOR ALL USING (auth.uid() IN (SELECT id FROM public.users WHERE role IN ('admin', 'manager')));
CREATE POLICY "Admin All Access on returns" ON public.returns FOR ALL USING (auth.uid() IN (SELECT id FROM public.users WHERE role IN ('admin', 'manager')));
CREATE POLICY "Admin All Access on refunds" ON public.refunds FOR ALL USING (auth.uid() IN (SELECT id FROM public.users WHERE role IN ('admin', 'manager')));
CREATE POLICY "Admin All Access on analytics" ON public.analytics FOR ALL USING (auth.uid() IN (SELECT id FROM public.users WHERE role IN ('admin', 'manager')));

-- 2. Public Read Policies for Catalog Items
CREATE POLICY "Public Read Brands" ON public.brands FOR SELECT USING (true);
CREATE POLICY "Public Read Categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Public Read Sub Categories" ON public.sub_categories FOR SELECT USING (true);
CREATE POLICY "Public Read Collections" ON public.collections FOR SELECT USING (true);
CREATE POLICY "Public Read Products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Public Read Product Images" ON public.product_images FOR SELECT USING (true);
CREATE POLICY "Public Read Product Videos" ON public.product_videos FOR SELECT USING (true);
CREATE POLICY "Public Read Banners" ON public.banners FOR SELECT USING (true);
CREATE POLICY "Public Read Homepage Sections" ON public.homepage_sections FOR SELECT USING (true);
CREATE POLICY "Public Read Shopping Videos" ON public.videos FOR SELECT USING (true);
CREATE POLICY "Public Read Testimonials" ON public.testimonials FOR SELECT USING (true);
CREATE POLICY "Public Read Blogs" ON public.blogs FOR SELECT USING (true);
CREATE POLICY "Public Read FAQ" ON public.faq FOR SELECT USING (true);
CREATE POLICY "Public Read Shipping Methods" ON public.shipping_methods FOR SELECT USING (true);
CREATE POLICY "Public Read Reviews" ON public.reviews FOR SELECT USING (true);

-- 3. Customer User Self Data Access Policies
CREATE POLICY "Users view own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.users FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users manage own address" ON public.addresses FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own cart" ON public.cart FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own wishlist" ON public.wishlist FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users place own orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users view own order items" ON public.order_items FOR SELECT USING (order_id IN (SELECT id FROM public.orders WHERE user_id = auth.uid()));

CREATE POLICY "Users submit reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own ratings" ON public.ratings FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users view own wallet" ON public.wallet FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users view own reward points" ON public.reward_points FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users view own referrals" ON public.referrals FOR SELECT USING (auth.uid() = referrer_id OR auth.uid() = referred_user_id);
CREATE POLICY "Users view own notifications" ON public.notifications FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users submit contact messages" ON public.contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Users view own returns" ON public.returns FOR SELECT USING (order_id IN (SELECT id FROM public.orders WHERE user_id = auth.uid()));
CREATE POLICY "Users request returns" ON public.returns FOR INSERT WITH CHECK (order_id IN (SELECT id FROM public.orders WHERE user_id = auth.uid()));
CREATE POLICY "Users view own refunds" ON public.refunds FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users log own analytics" ON public.analytics FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- ==========================================================
-- PROGRAMMATIC AUTOMATIC STORAGE BUCKETS
-- ==========================================================
-- Setup storage buckets for full assets
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('products', 'products', true),
  ('categories', 'categories', true),
  ('banners', 'banners', true),
  ('videos', 'videos', true),
  ('testimonials', 'testimonials', true),
  ('blogs', 'blogs', true),
  ('avatars', 'avatars', true),
  ('documents', 'documents', true)
ON CONFLICT (id) DO NOTHING;

-- RLS Object storage policies
CREATE POLICY "Public Read Access for products" ON storage.objects FOR SELECT USING (bucket_id = 'products');
CREATE POLICY "Public Read Access for categories" ON storage.objects FOR SELECT USING (bucket_id = 'categories');
CREATE POLICY "Public Read Access for banners" ON storage.objects FOR SELECT USING (bucket_id = 'banners');
CREATE POLICY "Public Read Access for videos" ON storage.objects FOR SELECT USING (bucket_id = 'videos');
CREATE POLICY "Public Read Access for testimonials" ON storage.objects FOR SELECT USING (bucket_id = 'testimonials');
CREATE POLICY "Public Read Access for blogs" ON storage.objects FOR SELECT USING (bucket_id = 'blogs');
CREATE POLICY "Public Read Access for avatars" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Public Read Access for documents" ON storage.objects FOR SELECT USING (bucket_id = 'documents');

CREATE POLICY "Staff Write Access for products" ON storage.objects FOR ALL USING (bucket_id = 'products') WITH CHECK (bucket_id = 'products');
CREATE POLICY "Staff Write Access for categories" ON storage.objects FOR ALL USING (bucket_id = 'categories') WITH CHECK (bucket_id = 'categories');
CREATE POLICY "Staff Write Access for banners" ON storage.objects FOR ALL USING (bucket_id = 'banners') WITH CHECK (bucket_id = 'banners');
CREATE POLICY "Staff Write Access for videos" ON storage.objects FOR ALL USING (bucket_id = 'videos') WITH CHECK (bucket_id = 'videos');
CREATE POLICY "Staff Write Access for testimonials" ON storage.objects FOR ALL USING (bucket_id = 'testimonials') WITH CHECK (bucket_id = 'testimonials');
CREATE POLICY "Staff Write Access for blogs" ON storage.objects FOR ALL USING (bucket_id = 'blogs') WITH CHECK (bucket_id = 'blogs');
CREATE POLICY "Staff Write Access for avatars" ON storage.objects FOR ALL USING (bucket_id = 'avatars') WITH CHECK (bucket_id = 'avatars');
CREATE POLICY "Staff Write Access for documents" ON storage.objects FOR ALL USING (bucket_id = 'documents') WITH CHECK (bucket_id = 'documents');
