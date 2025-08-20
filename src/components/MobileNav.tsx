import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { 
  Home, 
  Search, 
  ShoppingBag, 
  Heart, 
  User 
} from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';

const MobileNav = () => {
  const location = useLocation();
  const { totalItems } = useCart();
  const { user } = useAuth();

  const navItems = [
    {
      name: 'Home',
      path: '/',
      icon: Home,
    },
    {
      name: 'Shop',
      path: '/products',
      icon: Search,
    },
    {
      name: 'Cart',
      path: '/cart',
      icon: ShoppingBag,
      // badge: totalItems,
    },
    {
      name: 'Wishlist',
      path: '/wishlist',
      icon: Heart,
    },
    {
      name: user ? 'Profile' : 'Sign In',
      path: user ? '/profile' : '/auth',
      icon: User,
    },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-peach-cream border-t border-gold/20 px-4 py-2">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center space-y-1 py-2 px-3 rounded-lg transition-colors ${
                isActive 
                  ? 'text-gold bg-gold/10' 
                  : 'text-cream hover:text-gold hover:bg-gold/5'
              }`}
            >
              <div className="relative">
                <Icon className="h-5 w-5" />
                {item.badge && item.badge > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-2 -right-2 h-4 w-4 rounded-full p-0 flex items-center justify-center text-xs bg-gold text-deep-brown"
                  >
                    {item.badge}
                  </Badge>
                )}
              </div>
              <span className="text-xs font-medium">
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileNav;