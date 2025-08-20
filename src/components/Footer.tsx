import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-deep-brown text-cream mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-1 gap-8">
          {/* Brand */}
          <div className=" grid grid-cols-1 md:grid-cols-2 gap-7 justify-around">
            <div>
              <div className="text-2xl font-heading font-bold text-gold">
                WAMAN HAUS
              </div>
              <p className="text-sm  text-cream/80 leading-relaxed">
                We (M & I), the owners of Waman Haus, started this brand to
                bring you clothing that feels as good as it looks—quality,
                style, and authenticity in every piece. Your support means
                everything, and we can't wait for you to experience what we've
                created.
              </p>
            </div>

            <div>
              <div className="text-2xl font-heading font-bold text-gold">
                Owned By IR-AM
              </div>

              <p className="text-sm text-cream/80 leading-relaxed">
                Designed and managed with care by Founder Waman, with the
                strategic support of our Director MRU, and brought to life by
                our talented team-KRU, ORU & SY. Our brand is built on timeless
                design, thoughtful craftsmanship, and personal connections
                with every customer.
              </p>
            </div>

            <div className="flex items-center space-x-2 text-sm text-blush">
              <span>Made with</span>
              <Heart className="h-4 w-4 fill-current" />
              <span>for fashion lovers</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 justify-around gap-6">
            <div className="grid  grid-cols-2">
              {/* quikc links */}
              <div className="space-y-4">
                <h3 className="text-lg font-heading font-semibold text-gold">
                  Quick Links
                </h3>
                <div className="space-y-2">
                  <Link
                    to="/products"
                    className="block text-sm hover:text-gold transition-colors"
                  >
                    Shop All
                  </Link>
                  <Link
                    to="/products?category=new"
                    className="block text-sm hover:text-gold transition-colors"
                  >
                    New Arrivals
                  </Link>
                  <Link
                    to="/products?category=sale"
                    className="block text-sm hover:text-gold transition-colors"
                  >
                    Sale
                  </Link>
                  <Link
                    to="/products?category=collections"
                    className="block text-sm hover:text-gold transition-colors"
                  >
                    Collections
                  </Link>
                  <Link
                    to="/size-guide"
                    className="block text-sm hover:text-gold transition-colors"
                  >
                    Size Guide
                  </Link>
                </div>
              </div>

              {/* Customer Care */}
              <div className="space-y-4">
                <h3 className="text-lg font-heading font-semibold text-gold">
                  Customer Care
                </h3>
                <div className="space-y-2">
                  <Link
                    to="/contact"
                    className="block text-sm hover:text-gold transition-colors"
                  >
                    Contact Us
                  </Link>
                  <Link
                    to="/shipping"
                    className="block text-sm hover:text-gold transition-colors"
                  >
                    Shipping Info
                  </Link>
                  <Link
                    to="/returns"
                    className="block text-sm hover:text-gold transition-colors"
                  >
                    Returns & Exchanges
                  </Link>
                  <Link
                    to="/faq"
                    className="block text-sm hover:text-gold transition-colors"
                  >
                    FAQ
                  </Link>
                  <Link
                    to="/privacy"
                    className="block text-sm hover:text-gold transition-colors"
                  >
                    Privacy Policy
                  </Link>
                  <Link
                    to="/terms"
                    className="block text-sm hover:text-gold transition-colors"
                  >
                    Terms of Service
                  </Link>
                </div>
              </div>
            </div>

            {/* Newsletter */}
            <div className="space-y-4">
              <h3 className="text-lg font-heading font-semibold text-gold">
                Stay in Touch
              </h3>
              <p className="text-sm text-cream/80">
                Subscribe to our newsletter for exclusive offers and style
                updates.
              </p>
              <div className="space-y-2">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="bg-background/10 border-gold/20 text-cream placeholder:text-cream/60 focus:border-gold"
                />
              </div>
              <div className="pt-4">
                <p className="text-xs text-cream/60">
                  Follow us on social media for daily style inspiration
                </p>
                <div className="flex space-x-4 mt-2">
                  <a
                    href="https://www.instagram.com/waman.haus/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-cream hover:text-gold p-0 flex items-center gap-1"
                    >
                      Instagram
                    </Button>
                  </a>

                  <a href=" https://wa.me/917893765031">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-cream hover:text-gold p-0"
                    >
                      WhatsApp
                    </Button>
                  </a>
                  {/* <Button variant="ghost" size="sm" className="text-cream hover:text-gold p-0">
                  Pinterest
                </Button> */}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-cream/20">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-cream/60">
              © 2025 WAMAN HAUS. All rights reserved.
            </div>
            <div className="flex space-x-6 text-sm">
              <span className="text-cream/60">Secure payments</span>
              <span className="text-cream/60">Free shipping over ₹2000</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;