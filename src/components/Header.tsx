import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  ShoppingBag,
  User,
  Heart,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import wamanHausLogo from '@/assets/waman-haus-logo.png';

const Header = () => {
  const { user, signOut } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-peach-cream text-cream shadow-luxury">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <img
              src="./assets/waman-haus-logo.png"
              alt="WAMAN HAUS"
              className="h-10 w-auto"
            />
            <div className="hidden md:flex flex-col">
              <div className="text-xl font-heading font-bold text-gold">
                WAMAN HAUS
              </div>
              <div className="text-xs font-accent text-blush">
                Luxury Fashion
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/products" className="hover:text-gold transition-colors font-medium">
              Shop
            </Link>
            <Link to="/products?category=new" className="hover:text-gold transition-colors font-medium">
              New Arrivals
            </Link>
            <Link to="/products?category=sale" className="hover:text-gold transition-colors font-medium">
              Sale
            </Link>
            <Link to="/products?category=collections" className="hover:text-gold transition-colors font-medium">
              Collections
            </Link>
          </nav>

          {/* Search Bar */}
          <div className="hidden md:block flex-1 max-w-md mx-8">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 bg-background/10 border-gold/20 text-cream placeholder:text-cream/60 focus:border-gold"
              />
            </form>
          </div>

          {/* Right Icons */}
          <div className="flex items-center space-x-4">
            {/* Wishlist */}
            <Button
              variant="ghost"
              size="icon"
              className="relative hover:bg-gold/10 hover:text-gold"
              onClick={() => navigate('/wishlist')}
            >
              <Heart className="h-5 w-5" />
            </Button>

            {/* Cart */}
            <Button
              variant="ghost"
              size="icon"
              className="relative hover:bg-gold/10 hover:text-gold"
              onClick={() => navigate('/cart')}
            >
              <ShoppingBag className="h-5 w-5" />
              {totalItems > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-gold text-deep-brown"
                >
                  {totalItems}
                </Badge>
              )}
            </Button>

            {/* User Menu */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hover:bg-gold/10 hover:text-gold"
                  >
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    My Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/orders')}>
                    My Orders
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/wishlist')}>
                    Wishlist
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut}>
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-gold/10 hover:text-gold"
                onClick={() => navigate('/auth')}
              >
                <User className="h-5 w-5" />
              </Button>
            )}

            {/* Mobile Menu */}
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden hover:bg-gold/10 hover:text-gold"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <SheetHeader>
                  <SheetTitle className="text-left text-2xl font-heading text-gold">
                    WAMAN HAUS
                  </SheetTitle>
                </SheetHeader>
                <div className="mt-8 space-y-6">
                  {/* Mobile Search */}
                  <form onSubmit={handleSearch} className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      type="text"
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10"
                    />
                  </form>

                  {/* Mobile Navigation */}
                  <nav className="space-y-4">
                    <Link
                      to="/products"
                      className="block text-lg font-medium hover:text-gold transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Shop
                    </Link>
                    <Link
                      to="/products?category=new"
                      className="block text-lg font-medium hover:text-gold transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      New Arrivals
                    </Link>
                    <Link
                      to="/products?category=sale"
                      className="block text-lg font-medium hover:text-gold transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Sale
                    </Link>
                    <Link
                      to="/products?category=collections"
                      className="block text-lg font-medium hover:text-gold transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Collections
                    </Link>
                  </nav>

                  {/* Mobile User Menu */}
                  <div className="pt-6 border-t border-border">
                    {user ? (
                      <div className="space-y-4">
                        <Link
                          to="/profile"
                          className="block text-lg font-medium hover:text-gold transition-colors"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          My Profile
                        </Link>
                        <Link
                          to="/orders"
                          className="block text-lg font-medium hover:text-gold transition-colors"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          My Orders
                        </Link>
                        <Link
                          to="/wishlist"
                          className="block text-lg font-medium hover:text-gold transition-colors"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Wishlist
                        </Link>
                        <button
                          onClick={() => {
                            handleSignOut();
                            setIsMenuOpen(false);
                          }}
                          className="block text-lg font-medium hover:text-gold transition-colors text-left"
                        >
                          Sign Out
                        </button>
                      </div>
                    ) : (
                      <Link
                        to="/auth"
                        className="block text-lg font-medium hover:text-gold transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Sign In
                      </Link>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;