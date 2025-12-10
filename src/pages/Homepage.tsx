import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Heart, ShoppingBag, Star } from "lucide-react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import type { Tables } from "@/integrations/supabase/types";
import { fetchFeaturedProducts } from "@/lib/utils";

type FeaturedProduct = Tables<"featuredProducts">;

const categories = [
  {
    name: "Top (Men)",
    count: 4,
    image: "./assets/mtop (2).png",
    categoryUrl: "Top (Men)",
  },
  {
    name: "Bottoms (Men)",
    count: 0,
    image: "./assets/mbottom.png",
    categoryUrl: "Bottoms (Men)",
  },

  {
    name: "Western (Women)",
    Coming: "COMING SOON",
    count: 0,
    image: "./assets/wwest.jpg",
    categoryUrl: "Western (Women)",
  },
  {
    name: "Indian Dresses (Women)",
    Coming: "COMING SOON",
    count: 0,
    image: "./assets/windi.png",
    categoryUrl: "Indian Dresses (Women)",
  },
];

const Homepage = () => {
  const [heroRef, heroInView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const rootMargin = "-20% 0px -80% 0px";
  const [categoriesRef, categoriesInView] = useInView({
    triggerOnce: true,
    rootMargin,
  });
  const [productsRef, productsInView] = useInView({
    triggerOnce: true,
    rootMargin,
  });
  const [featuresRef, featuresInView] = useInView({
    triggerOnce: true,
    rootMargin,
  });

  const [featuredProducts, setFeaturedProducts] = useState<FeaturedProduct[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  const videoList = [
    "assets/IMG_9737.MOV",
    "./assets/banda1.mp4",
    "./assets/banda2.mp4",
    "./assets/banda2.mp4",
    "./assets/banda2.mp4",
  ];
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleVideoEnd = () => {
    setCurrentVideoIndex((prevIndex) => (prevIndex + 1) % videoList.length);
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const products = await fetchFeaturedProducts();
        setFeaturedProducts(products);
      } catch (err) {
        console.error("Failed to fetch featured products", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // --- MODIFICATION START ---
  // Create a URL for all women's categories.
  const womenCategoryNames = categories
    .filter(cat => cat.name.includes("Women"))
    .map(cat => `category=${encodeURIComponent(cat.categoryUrl)}`)
    .join('&');
  const womenCollectionUrl = `/products?${womenCategoryNames}`;
  // --- MODIFICATION END ---

  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative h-[90vh] md:h-screen flex items-center justify-center text-black overflow-hidden"
      >
        <div className="absolute inset-0 z-0">
          <video
            key={videoList[currentVideoIndex]}
            autoPlay
            muted
            playsInline
            onEnded={handleVideoEnd}
            className="w-full h-full object-cover"
          >
            <source src={videoList[currentVideoIndex]} type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-pink-950/30 backdrop-blur-sm" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={heroInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center px-4 w-full max-w-4xl mx-auto"
        >
          <Badge
            variant="secondary"
            className="mb-3 sm:mb-4 md:mb-6 bg-gold/20 text-gold text-sm sm:text-base md:text-lg border-gold/30"
          >
            New Collection Available
          </Badge>

          <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl font-accent font-bold mb-4 sm:mb-6 text-white mix-blend-exclusion leading-tight">
            As seen on
            <span className="block text-white font-heading mix-blend-exclusion">
              Instagram
            </span>
          </h1>

          <p className="text-sm xs:text-base sm:text-lg md:text-xl text-white mb-5 sm:mb-6 md:mb-8 max-w-[90%] mx-auto leading-relaxed">
            Discover our curated collection of luxury fashion pieces designed
            for the modern Men and Women who value style, comfort, and timeless
            elegance.
          </p>

          <div className="flex flex-row xs:flex-row gap-2 sm:gap-3 md:gap-4 justify-center">
            <Button
              asChild
              size={isMobile ? "default" : "lg"}
              className="bg-deep-brown hover:bg-deep-brown/90 text-white text-sm sm:text-base md:text-lg shadow-luxury"
            >
              <Link to="/products">Men's Collection</Link>
            </Button>

            {/* --- MODIFICATION START --- */}
            {/* Re-enabled the button and restored the "Coming Soon" badge */}
            <div className="relative inline-block">
              <Button
                asChild
                variant="outline"
                size={isMobile ? "default" : "lg"}
                className="border-cream text-cream text-sm sm:text-base md:text-lg hover:bg-cream/10"
              >
                <Link to={womenCollectionUrl}>Women's Collection</Link>
              </Button>
              <div className="absolute -top-2 -right-2 bg-red-600 text-white text-xs px-2 py-0.5 rounded-full shadow-md">
                Coming Soon
              </div>
            </div>
            {/* --- MODIFICATION END --- */}

          </div>
        </motion.div>
      </section>

      {/* Categories Section */}
      <section ref={categoriesRef} className="py-12 sm:py-16 bg-secondary/20">
        <div className="container mx-auto px-4 sm:px-6 text-center mb-8 sm:mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={categoriesInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold text-deep-brown mb-3 sm:mb-4"
          >
            Shop by Category
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={categoriesInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            Explore our diverse collection of premium fashion pieces
          </motion.p>
        </div>

        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {categories.map((category, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={categoriesInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                {/* --- MODIFICATION START --- */}
                {/* All category cards are now clickable links */}
                <Link to={`/products?category=${encodeURIComponent(category.categoryUrl)}`}>
                  <Card className="group hover:shadow-elegant transition duration-300 h-full relative">
                    <CardContent className="p-0 h-full flex flex-col">
                       {category.Coming && (
                        <div className="absolute top-2 right-2 z-10 bg-red-600 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
                          {category.Coming}
                        </div>
                      )}
                      <div className="aspect-square bg-gradient-to-b from-blush to-cream/50 flex items-center justify-center overflow-hidden">
                        <img
                          src={category.image}
                          alt={category.name}
                          className="h-full w-full object-cover mt-10 transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                      <div className="text-center p-4 flex-grow flex flex-col justify-center">
                        <h3 className="font-heading text-lg sm:text-xl text-deep-brown font-semibold mb-1">
                          {category.name}
                        </h3>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          {category.count} items
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
                {/* --- MODIFICATION END --- */}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section ref={productsRef} className="py-12 sm:py-16 bg-background">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-12">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={productsInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6 }}
              className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold text-deep-brown mb-3 sm:mb-4"
            >
              Featured Products
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={productsInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto"
            >
              Handpicked favorites from our latest collection
            </motion.p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-deep-brown"></div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {featuredProducts.map((product, i) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={productsInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="flex"
                >
                  <Card className="group hover:shadow-elegant transition-all duration-300 overflow-hidden flex flex-col h-full w-full">
                    <CardContent className="p-0 flex flex-col h-full">
                      <div className="relative flex-grow">
                        <div className="aspect-[3/4] bg-gradient-to-b from-blush to-cream/50 flex items-center justify-center overflow-hidden">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        </div>
                        <div className="absolute top-3 left-3 flex flex-col gap-2">
                          {product.isNew && (
                            <Badge className="bg-gold text-deep-brown text-xs sm:text-sm">
                              New
                            </Badge>
                          )}
                          {product.isSale && (
                            <Badge
                              variant="destructive"
                              className="text-xs sm:text-sm"
                            >
                              Sale
                            </Badge>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-3 right-3 bg-white/80 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Heart className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="p-4 space-y-2 flex flex-col flex-grow">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center">
                            <Star className="h-4 w-4 fill-gold text-gold" />
                            <span className="text-xs sm:text-sm font-medium ml-1">
                              {product.rating}
                            </span>
                          </div>
                          <span className="text-xs sm:text-sm text-muted-foreground">
                            ({product.reviews})
                          </span>
                        </div>

                        <h3 className="font-heading font-semibold text-base sm:text-lg text-deep-brown group-hover:text-gold transition-colors line-clamp-2">
                          {product.name}
                        </h3>

                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-base sm:text-lg font-bold text-deep-brown">
                            ₹{product.price.toLocaleString()}
                          </span>
                          {product.originalPrice && (
                            <span className="text-xs sm:text-sm text-muted-foreground line-through">
                              ₹{product.originalPrice.toLocaleString()}
                            </span>
                          )}
                        </div>

                        <Button
                          asChild
                          className="mt-4 w-full bg-deep-brown hover:bg-deep-brown/90 text-cream text-sm sm:text-base"
                        >
                          <Link to={`/products/${product.id}`}>
                            View Details
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={productsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center mt-10 sm:mt-12"
          >
            <Button
              asChild
              variant="outline"
              size={isMobile ? "default" : "lg"}
              className="border-deep-brown text-deep-brown hover:bg-deep-brown hover:text-cream"
            >
              <Link to="/products">
                View All Products <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section
        ref={featuresRef}
        className="py-10 sm:py-12 md:py-16 bg-background"
      >
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={featuresInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
          >
            {[
              {
                icon: (
                  <ShoppingBag className="h-6 sm:h-8 w-6 sm:w-8 text-white" />
                ),
                title: "Free Shipping",
                desc: "Complimentary shipping on orders over ₹2000",
              },
              {
                icon: <Heart className="h-6 sm:h-8 w-6 sm:w-8 text-white" />,
                title: "Handpicked Styles",
                desc: "Curated looks chosen for timeless elegance",
              },
              {
                icon: <Star className="h-6 sm:h-8 w-6 sm:w-8 text-white" />,
                title: "Premium Quality",
                desc: "Carefully curated pieces from top designers",
              },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={featuresInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="text-center space-y-3 sm:space-y-4 p-4 sm:p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-luxury rounded-full flex items-center justify-center mx-auto">
                  {feature.icon}
                </div>
                <h3 className="text-lg sm:text-xl md:text-2xl font-heading font-semibold text-deep-brown">
                  {feature.title}
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-12 sm:py-16 bg-gradient-warm text-cream">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={featuresInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold mb-3 sm:mb-4">
              Stay in Style
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-cream/90 mb-6 sm:mb-8 max-w-2xl mx-auto">
              Subscribe to our newsletter for exclusive offers, style tips, and
              early access to new collections.
            </p>

            <div className="max-w-md mx-auto flex flex-col sm:flex-row gap-3 sm:gap-4">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 sm:py-3 rounded-lg border-0 bg-white/20 text-cream placeholder:text-cream/70 focus:bg-white/30 focus:outline-none text-sm sm:text-base"
              />
              <Button
                className="bg-gold hover:bg-gold/90 text-deep-brown font-medium px-4 sm:px-6 text-sm sm:text-base"
                size={isMobile ? "default" : "lg"}
              >
                Subscribe
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Homepage;