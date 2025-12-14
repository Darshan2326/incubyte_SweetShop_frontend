import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Homepage = () => {
    const navigate = useNavigate();
    const [sweets, setSweets] = useState([]);
    const [allSweets, setAllSweets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [userName, setUserName] = useState("");
    const [purchaseQuantities, setPurchaseQuantities] = useState({});
    const [activeCategory, setActiveCategory] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [cartItems, setCartItems] = useState([]);
    const [showCart, setShowCart] = useState(false);
    const [purchaseSuccess, setPurchaseSuccess] = useState(null);

    useEffect(() => {
        const user = localStorage.getItem("user");
        if (user) {
            try {
                const userData = JSON.parse(user);
                setUserRole(userData.role);
                setUserName(userData.name || "Sweet Lover");
            } catch (e) {
                console.error("Error parsing user data:", e);
            }
        }

        const fetchSweets = async () => {
            try {
                const response = await fetch("https://incubyte-sweetshop-backend.onrender.com/api/sweets");
                if (!response.ok) {
                    throw new Error("Failed to fetch sweets");
                }
                const data = await response.json();
                setSweets(data);
                setAllSweets(data);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchSweets();
    }, []);

    // Filter sweets based on category and search
    useEffect(() => {
        let filtered = [...allSweets];

        if (activeCategory !== "all") {
            filtered = filtered.filter(sweet =>
                sweet.category.toLowerCase() === activeCategory.toLowerCase()
            );
        }

        if (searchTerm) {
            filtered = filtered.filter(sweet =>
                sweet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                sweet.category.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setSweets(filtered);
    }, [activeCategory, searchTerm, allSweets]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/");
    };

    const handlePurchaseQuantityChange = (sweetId, value) => {
        const sweet = sweets.find(s => s._id === sweetId);
        const maxQty = sweet ? sweet.quantity : 1;
        const qty = Math.min(Math.max(1, parseInt(value) || 1), maxQty);
        setPurchaseQuantities(prev => ({
            ...prev,
            [sweetId]: qty
        }));
    };

    const handlePurchase = async (sweetId) => {
        const quantity = purchaseQuantities[sweetId] || 1;
        const sweet = sweets.find(s => s._id === sweetId);

        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`https://incubyte-sweetshop-backend.onrender.com/api/sweets/${sweetId}/purchese?quantity=${quantity}`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || "Failed to purchase sweet");
            }

            const updatedSweets = sweets.map(s => {
                if (s._id === sweetId) {
                    return { ...s, quantity: s.quantity - quantity };
                }
                return s;
            });

            setSweets(updatedSweets);
            setAllSweets(prev => prev.map(s => {
                if (s._id === sweetId) {
                    return { ...s, quantity: s.quantity - quantity };
                }
                return s;
            }));

            setPurchaseSuccess({
                name: sweet.name,
                quantity: quantity,
                total: (sweet.price * quantity).toFixed(2)
            });

            setTimeout(() => setPurchaseSuccess(null), 4000);
        } catch (err) {
            alert("Error purchasing sweet: " + err.message);
        }
    };

    const addToCart = (sweet) => {
        const quantity = purchaseQuantities[sweet._id] || 1;
        const existingItem = cartItems.find(item => item._id === sweet._id);

        if (existingItem) {
            setCartItems(cartItems.map(item =>
                item._id === sweet._id
                    ? { ...item, cartQuantity: item.cartQuantity + quantity }
                    : item
            ));
        } else {
            setCartItems([...cartItems, { ...sweet, cartQuantity: quantity }]);
        }
    };

    const removeFromCart = (sweetId) => {
        setCartItems(cartItems.filter(item => item._id !== sweetId));
    };

    const getCartTotal = () => {
        return cartItems.reduce((total, item) => total + (item.price * item.cartQuantity), 0);
    };

    // Get unique categories
    const categories = ["all", ...new Set(allSweets.map(sweet => sweet.category.toLowerCase()))];

    // Get category icon
    const getCategoryIcon = (category) => {
        const cat = category.toLowerCase();
        if (cat.includes('cake')) return '🎂';
        if (cat.includes('chocolate')) return '🍫';
        if (cat.includes('candy')) return '🍬';
        if (cat.includes('donut') || cat.includes('doughnut')) return '🍩';
        if (cat.includes('cookie')) return '🍪';
        if (cat.includes('ice')) return '🍦';
        if (cat.includes('cupcake')) return '🧁';
        if (cat.includes('pie')) return '🥧';
        if (cat.includes('pastry')) return '🥐';
        if (cat === 'all') return '🍭';
        return '🍰';
    };

    if (loading) {
        return (
            <div style={styles.loadingContainer}>
                <div style={styles.loadingContent}>
                    <div style={styles.loadingSpinner}></div>
                    <div style={styles.loadingIconContainer}>
                        <span style={styles.loadingIcon}>🍰</span>
                    </div>
                    <h2 style={styles.loadingTitle}>Loading Sweet Delights...</h2>
                    <p style={styles.loadingSubtitle}>Preparing delicious treats for you</p>
                    <div style={styles.loadingDots}>
                        <span style={{ ...styles.loadingDot, animationDelay: '0s' }}>🍬</span>
                        <span style={{ ...styles.loadingDot, animationDelay: '0.2s' }}>🍩</span>
                        <span style={{ ...styles.loadingDot, animationDelay: '0.4s' }}>🧁</span>
                        <span style={{ ...styles.loadingDot, animationDelay: '0.6s' }}>🍪</span>
                    </div>
                </div>
                <style>{keyframes}</style>
            </div>
        );
    }

    if (error) {
        return (
            <div style={styles.errorContainer}>
                <div style={styles.errorContent}>
                    <span style={styles.errorIcon}>😢</span>
                    <h2 style={styles.errorTitle}>Oops! Something went wrong</h2>
                    <p style={styles.errorMessage}>{error}</p>
                    <button
                        style={styles.retryButton}
                        onClick={() => window.location.reload()}
                    >
                        🔄 Try Again
                    </button>
                </div>
                <style>{keyframes}</style>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            {/* Floating Decorations */}
            <div style={styles.floatingCandy1}>🍭</div>
            <div style={styles.floatingCandy2}>🍩</div>
            <div style={styles.floatingCandy3}>🧁</div>
            <div style={styles.floatingCandy4}>🍪</div>
            <div style={styles.floatingCandy5}>🍫</div>
            <div style={styles.floatingCandy6}>🍬</div>
            <div style={styles.floatingCandy7}>🎂</div>
            <div style={styles.floatingCandy8}>🍦</div>

            {/* Success Notification */}
            {purchaseSuccess && (
                <div style={styles.successNotification}>
                    <span style={styles.successIcon}>🎉</span>
                    <div style={styles.successText}>
                        <strong>Purchase Successful!</strong>
                        <p>{purchaseSuccess.quantity}x {purchaseSuccess.name} - ${purchaseSuccess.total}</p>
                    </div>
                </div>
            )}

            {/* Navigation Bar */}
            <nav style={styles.navbar}>
                <div style={styles.navContent}>
                    <div style={styles.navBrand}>
                        <div style={styles.navLogo}>
                            <span style={styles.navLogoIcon}>🍰</span>
                        </div>
                        <div style={styles.navBrandText}>
                            <h1 style={styles.navTitle}>Sweet Delights</h1>
                            <p style={styles.navSubtitle}>Handcrafted Happiness</p>
                        </div>
                    </div>

                    <div style={styles.navSearch}>
                        <span style={styles.searchIcon}>🔍</span>
                        <input
                            type="text"
                            placeholder="Search for sweets..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={styles.searchInput}
                        />
                    </div>

                    <div style={styles.navActions}>
                        <button
                            style={styles.cartButton}
                            onClick={() => setShowCart(!showCart)}
                        >
                            <span>🛒</span>
                            {cartItems.length > 0 && (
                                <span style={styles.cartBadge}>{cartItems.length}</span>
                            )}
                        </button>
                        <div style={styles.userSection}>
                            <div style={styles.userAvatar}>
                                {userName.charAt(0).toUpperCase()}
                            </div>
                            <span style={styles.userGreeting}>Hi, {userName.split(' ')[0]}!</span>
                        </div>
                        <button style={styles.logoutBtn} onClick={handleLogout}>
                            <span>🚪</span> Logout
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section style={styles.heroSection}>
                <div style={styles.heroContent}>
                    <h1 style={styles.heroTitle}>
                        Discover Our <span style={styles.heroHighlight}>Delicious</span> Collection
                    </h1>
                    <p style={styles.heroSubtitle}>
                        Handcrafted sweets made with love. From traditional favorites to unique creations,
                        find your perfect treat today!
                    </p>
                    <div style={styles.heroStats}>
                        <div style={styles.heroStat}>
                            <span style={styles.heroStatNumber}>{allSweets.length}</span>
                            <span style={styles.heroStatLabel}>Varieties</span>
                        </div>
                        <div style={styles.heroStatDivider}></div>
                        <div style={styles.heroStat}>
                            <span style={styles.heroStatNumber}>{categories.length - 1}</span>
                            <span style={styles.heroStatLabel}>Categories</span>
                        </div>
                        <div style={styles.heroStatDivider}></div>
                        <div style={styles.heroStat}>
                            <span style={styles.heroStatNumber}>100%</span>
                            <span style={styles.heroStatLabel}>Fresh</span>
                        </div>
                    </div>
                </div>
                <div style={styles.heroDecoration}>
                    <div style={styles.heroDecoCircle1}>🍰</div>
                    <div style={styles.heroDecoCircle2}>🧁</div>
                    <div style={styles.heroDecoCircle3}>🍩</div>
                </div>
            </section>

            {/* Category Filter */}
            <section style={styles.categorySection}>
                <h2 style={styles.categorySectionTitle}>🏷️ Browse by Category</h2>
                <div style={styles.categoryContainer}>
                    {categories.map((category) => (
                        <button
                            key={category}
                            style={{
                                ...styles.categoryButton,
                                ...(activeCategory === category ? styles.categoryButtonActive : {})
                            }}
                            onClick={() => setActiveCategory(category)}
                        >
                            <span style={styles.categoryIcon}>{getCategoryIcon(category)}</span>
                            <span style={styles.categoryName}>
                                {category.charAt(0).toUpperCase() + category.slice(1)}
                            </span>
                        </button>
                    ))}
                </div>
            </section>

            {/* Products Section */}
            <section style={styles.productsSection}>
                <div style={styles.productsSectionHeader}>
                    <h2 style={styles.sectionTitle}>
                        🍬 {activeCategory === 'all' ? 'All Sweets' : activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)}
                        <span style={styles.productCount}>({sweets.length} items)</span>
                    </h2>
                    {searchTerm && (
                        <p style={styles.searchResultText}>
                            Showing results for "<strong>{searchTerm}</strong>"
                        </p>
                    )}
                </div>

                {sweets.length === 0 ? (
                    <div style={styles.emptyState}>
                        <span style={styles.emptyIcon}>🔍</span>
                        <h3 style={styles.emptyTitle}>No sweets found</h3>
                        <p style={styles.emptyText}>
                            {searchTerm
                                ? `We couldn't find any sweets matching "${searchTerm}"`
                                : "No sweets available in this category"}
                        </p>
                        <button
                            style={styles.emptyButton}
                            onClick={() => {
                                setSearchTerm("");
                                setActiveCategory("all");
                            }}
                        >
                            View All Sweets
                        </button>
                    </div>
                ) : (
                    <div style={styles.productsGrid}>
                        {sweets.map((sweet, index) => (
                            <div
                                key={sweet._id}
                                style={{
                                    ...styles.productCard,
                                    animationDelay: `${index * 0.1}s`
                                }}
                            >
                                {/* Card Header with Icon */}
                                <div style={styles.cardHeader}>
                                    <div style={styles.cardIconWrapper}>
                                        <span style={styles.cardIcon}>
                                            {getCategoryIcon(sweet.category)}
                                        </span>
                                    </div>
                                    {sweet.quantity <= 5 && sweet.quantity > 0 && (
                                        <span style={styles.limitedBadge}>
                                            🔥 Only {sweet.quantity} left!
                                        </span>
                                    )}
                                    {sweet.quantity === 0 && (
                                        <span style={styles.outOfStockBadge}>
                                            Out of Stock
                                        </span>
                                    )}
                                </div>

                                {/* Card Body */}
                                <div style={styles.cardBody}>
                                    <span style={styles.categoryTag}>{sweet.category}</span>
                                    <h3 style={styles.productName}>{sweet.name}</h3>

                                    <div style={styles.productMeta}>
                                        <div style={styles.priceSection}>
                                            <span style={styles.priceLabel}>Price</span>
                                            <span style={styles.priceValue}>
                                                ${sweet.price.toFixed(2)}
                                            </span>
                                        </div>
                                        <div style={styles.stockSection}>
                                            <span style={styles.stockLabel}>In Stock</span>
                                            <span style={{
                                                ...styles.stockValue,
                                                color: sweet.quantity > 10 ? '#27ae60' :
                                                    sweet.quantity > 0 ? '#f39c12' : '#e74c3c'
                                            }}>
                                                {sweet.quantity} pcs
                                            </span>
                                        </div>
                                    </div>

                                    {/* Quantity Selector */}
                                    <div style={styles.quantitySection}>
                                        <label style={styles.quantityLabel}>Quantity:</label>
                                        <div style={styles.quantityControls}>
                                            <button
                                                style={styles.quantityBtn}
                                                onClick={() => handlePurchaseQuantityChange(
                                                    sweet._id,
                                                    (purchaseQuantities[sweet._id] || 1) - 1
                                                )}
                                                disabled={sweet.quantity === 0}
                                            >
                                                −
                                            </button>
                                            <input
                                                type="number"
                                                min="1"
                                                max={sweet.quantity}
                                                value={purchaseQuantities[sweet._id] || 1}
                                                onChange={(e) => handlePurchaseQuantityChange(sweet._id, e.target.value)}
                                                style={styles.quantityInput}
                                                disabled={sweet.quantity === 0}
                                            />
                                            <button
                                                style={styles.quantityBtn}
                                                onClick={() => handlePurchaseQuantityChange(
                                                    sweet._id,
                                                    (purchaseQuantities[sweet._id] || 1) + 1
                                                )}
                                                disabled={sweet.quantity === 0 || (purchaseQuantities[sweet._id] || 1) >= sweet.quantity}
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>

                                    {/* Total Price */}
                                    <div style={styles.totalSection}>
                                        <span style={styles.totalLabel}>Total:</span>
                                        <span style={styles.totalValue}>
                                            ${(sweet.price * (purchaseQuantities[sweet._id] || 1)).toFixed(2)}
                                        </span>
                                    </div>
                                </div>

                                {/* Card Actions */}
                                <div style={styles.cardActions}>
                                    <button
                                        style={{
                                            ...styles.addToCartBtn,
                                            ...(sweet.quantity === 0 ? styles.disabledBtn : {})
                                        }}
                                        onClick={() => addToCart(sweet)}
                                        disabled={sweet.quantity === 0}
                                    >
                                        <span>🛒</span> Add to Cart
                                    </button>
                                    <button
                                        style={{
                                            ...styles.buyNowBtn,
                                            ...(sweet.quantity === 0 ? styles.disabledBtn : {})
                                        }}
                                        onClick={() => handlePurchase(sweet._id)}
                                        disabled={sweet.quantity === 0}
                                    >
                                        <span>⚡</span> Buy Now
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* Shopping Cart Sidebar */}
            {showCart && (
                <div style={styles.cartOverlay} onClick={() => setShowCart(false)}>
                    <div style={styles.cartSidebar} onClick={(e) => e.stopPropagation()}>
                        <div style={styles.cartHeader}>
                            <h2 style={styles.cartTitle}>🛒 Shopping Cart</h2>
                            <button
                                style={styles.cartCloseBtn}
                                onClick={() => setShowCart(false)}
                            >
                                ✕
                            </button>
                        </div>

                        {cartItems.length === 0 ? (
                            <div style={styles.emptyCart}>
                                <span style={styles.emptyCartIcon}>🛒</span>
                                <p style={styles.emptyCartText}>Your cart is empty</p>
                                <button
                                    style={styles.continueShoppingBtn}
                                    onClick={() => setShowCart(false)}
                                >
                                    Continue Shopping
                                </button>
                            </div>
                        ) : (
                            <>
                                <div style={styles.cartItems}>
                                    {cartItems.map(item => (
                                        <div key={item._id} style={styles.cartItem}>
                                            <div style={styles.cartItemIcon}>
                                                {getCategoryIcon(item.category)}
                                            </div>
                                            <div style={styles.cartItemInfo}>
                                                <h4 style={styles.cartItemName}>{item.name}</h4>
                                                <p style={styles.cartItemPrice}>
                                                    ${item.price.toFixed(2)} × {item.cartQuantity}
                                                </p>
                                            </div>
                                            <div style={styles.cartItemTotal}>
                                                ${(item.price * item.cartQuantity).toFixed(2)}
                                            </div>
                                            <button
                                                style={styles.cartItemRemove}
                                                onClick={() => removeFromCart(item._id)}
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                <div style={styles.cartFooter}>
                                    <div style={styles.cartTotal}>
                                        <span>Total:</span>
                                        <span style={styles.cartTotalValue}>
                                            ${getCartTotal().toFixed(2)}
                                        </span>
                                    </div>
                                    <button style={styles.checkoutBtn}>
                                        <span>💳</span> Proceed to Checkout
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Footer */}
            <footer style={styles.footer}>
                <div style={styles.footerContent}>
                    <div style={styles.footerBrand}>
                        <span style={styles.footerLogo}>🍰</span>
                        <h3 style={styles.footerTitle}>Sweet Delights</h3>
                        <p style={styles.footerTagline}>Handcrafted with love since 2024</p>
                    </div>
                    <div>
                        <h4 style={styles.footerTitle}>Developer</h4>
                        <p style={styles.footerTagline}>Developed By Darshan Ramani</p>
                        <p style={styles.footerTagline}>Contact: darshan.ramani.099@gmail.com</p>
                        <p style={styles.footerTagline}>Github : https://github.com/Darshan2326</p>
                        <p style={styles.footerTagline}>LinkedIn : https://www.linkedin.com/in/darshan-ramani-7182b4289/</p>
                        <p style={styles.footerTagline}>Stay Sweet!</p>

                    </div>
                    <div style={styles.footerLinks}>
                        <div style={styles.footerColumn}>
                            <h4 style={styles.footerColumnTitle}>Quick Links</h4>
                            <a href="#" style={styles.footerLink}>About Us</a>
                            <a href="#" style={styles.footerLink}>Our Story</a>
                            <a href="#" style={styles.footerLink}>Contact</a>
                        </div>
                        <div style={styles.footerColumn}>
                            <h4 style={styles.footerColumnTitle}>Categories</h4>
                            <a href="#" style={styles.footerLink}>Cakes</a>
                            <a href="#" style={styles.footerLink}>Chocolates</a>
                            <a href="#" style={styles.footerLink}>Candies</a>
                        </div>
                        <div style={styles.footerColumn}>
                            <h4 style={styles.footerColumnTitle}>Follow Us</h4>
                            <div style={styles.socialLinks}>
                                <span style={styles.socialIcon}>📘</span>
                                <span style={styles.socialIcon}>📸</span>
                                <span style={styles.socialIcon}>🐦</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div style={styles.footerBottom}>
                    <p>© 2024 Sweet Delights. Made with 💖 and lots of sugar!</p>
                </div>
            </footer>

            <style>{keyframes}</style>
        </div>
    );
};

// CSS Keyframes
const keyframes = `
    @keyframes float {
        0%, 100% { transform: translateY(0px) rotate(0deg); }
        50% { transform: translateY(-20px) rotate(10deg); }
    }
    @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.1); }
    }
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    @keyframes bounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-10px); }
    }
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(100%);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    @keyframes slideInDown {
        from {
            opacity: 0;
            transform: translateY(-100%);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    @keyframes shimmer {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
    }
    @keyframes glow {
        0%, 100% { box-shadow: 0 0 20px rgba(255, 107, 157, 0.3); }
        50% { box-shadow: 0 0 40px rgba(255, 107, 157, 0.6); }
    }
    @keyframes scaleIn {
        from {
            opacity: 0;
            transform: scale(0.9);
        }
        to {
            opacity: 1;
            transform: scale(1);
        }
    }
`;

const styles = {
    container: {
        minHeight: "100vh",
        // height: "100",
        width: "100vw",
        // display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 50%, #ee9ca7 100%)",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        position: "relative",
        overflow: "hidden",
    },
    // Floating candies
    floatingCandy1: {
        position: "fixed",
        top: "15%",
        left: "3%",
        fontSize: "35px",
        animation: "float 4s ease-in-out infinite",
        opacity: "0.5",
        zIndex: 0,
        pointerEvents: "none",
    },
    floatingCandy2: {
        position: "fixed",
        top: "25%",
        right: "5%",
        fontSize: "30px",
        animation: "float 5s ease-in-out infinite 0.5s",
        opacity: "0.5",
        zIndex: 0,
        pointerEvents: "none",
    },
    floatingCandy3: {
        position: "fixed",
        bottom: "30%",
        left: "8%",
        fontSize: "40px",
        animation: "float 4.5s ease-in-out infinite 1s",
        opacity: "0.5",
        zIndex: 0,
        pointerEvents: "none",
    },
    floatingCandy4: {
        position: "fixed",
        bottom: "20%",
        right: "3%",
        fontSize: "32px",
        animation: "float 5.5s ease-in-out infinite 0.3s",
        opacity: "0.5",
        zIndex: 0,
        pointerEvents: "none",
    },
    floatingCandy5: {
        position: "fixed",
        top: "50%",
        left: "2%",
        fontSize: "28px",
        animation: "float 6s ease-in-out infinite 0.7s",
        opacity: "0.4",
        zIndex: 0,
        pointerEvents: "none",
    },
    floatingCandy6: {
        position: "fixed",
        top: "70%",
        right: "8%",
        fontSize: "34px",
        animation: "float 4.8s ease-in-out infinite 1.2s",
        opacity: "0.4",
        zIndex: 0,
        pointerEvents: "none",
    },
    floatingCandy7: {
        position: "fixed",
        top: "40%",
        right: "2%",
        fontSize: "26px",
        animation: "float 5.2s ease-in-out infinite 0.9s",
        opacity: "0.4",
        zIndex: 0,
        pointerEvents: "none",
    },
    floatingCandy8: {
        position: "fixed",
        bottom: "10%",
        left: "5%",
        fontSize: "30px",
        animation: "float 4.3s ease-in-out infinite 1.5s",
        opacity: "0.4",
        zIndex: 0,
        pointerEvents: "none",
    },
    // Success Notification
    successNotification: {
        position: "fixed",
        top: "100px",
        right: "30px",
        background: "linear-gradient(135deg, #00b894 0%, #00cec9 100%)",
        color: "#fff",
        padding: "20px 30px",
        borderRadius: "15px",
        display: "flex",
        alignItems: "center",
        gap: "15px",
        boxShadow: "0 10px 40px rgba(0, 184, 148, 0.4)",
        zIndex: 1000,
        animation: "slideInRight 0.5s ease",
    },
    successIcon: {
        fontSize: "30px",
    },
    successText: {
        lineHeight: "1.4",
    },
    // Navbar
    navbar: {
        background: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(20px)",
        boxShadow: "0 5px 30px rgba(0, 0, 0, 0.1)",
        padding: "15px 0",
        position: "sticky",
        top: 0,
        zIndex: 100,
    },
    navContent: {
        maxWidth: "1400px",
        margin: "0 auto",
        padding: "0 30px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "30px",
        flexWrap: "wrap",
    },
    navBrand: {
        display: "flex",
        alignItems: "center",
        gap: "15px",
    },
    navLogo: {
        width: "55px",
        height: "55px",
        background: "linear-gradient(135deg, #ff6b9d 0%, #c44569 100%)",
        borderRadius: "15px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 5px 20px rgba(255, 107, 157, 0.4)",
        animation: "pulse 2s ease-in-out infinite",
    },
    navLogoIcon: {
        fontSize: "30px",
    },
    navBrandText: {},
    navTitle: {
        fontSize: "24px",
        fontWeight: "800",
        color: "#c44569",
        margin: 0,
    },
    navSubtitle: {
        fontSize: "12px",
        color: "#888",
        margin: 0,
        letterSpacing: "1px",
    },
    navSearch: {
        flex: 1,
        maxWidth: "400px",
        position: "relative",
        display: "flex",
        alignItems: "center",
    },
    searchIcon: {
        position: "absolute",
        left: "18px",
        fontSize: "18px",
        pointerEvents: "none",
        color: "#000000"

    },
    searchInput: {
        width: "100%",
        padding: "15px 20px 15px 50px",
        border: "2px solid #f0f0f0",
        borderRadius: "15px",
        fontSize: "15px",
        background: "#fafafa",
        transition: "all 0.3s ease",
        outline: "none",
        color: "#000000"
    },
    navActions: {
        display: "flex",
        alignItems: "center",
        gap: "15px",
    },
    cartButton: {
        position: "relative",
        width: "50px",
        height: "50px",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        border: "none",
        borderRadius: "15px",
        fontSize: "22px",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 5px 20px rgba(102, 126, 234, 0.4)",
        transition: "transform 0.3s ease",
    },
    cartBadge: {
        position: "absolute",
        top: "-5px",
        right: "-5px",
        width: "22px",
        height: "22px",
        background: "#e74c3c",
        color: "#fff",
        borderRadius: "50%",
        fontSize: "12px",
        fontWeight: "bold",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    },
    userSection: {
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "8px 15px",
        background: "#f8f0f0",
        borderRadius: "25px",
    },
    userAvatar: {
        width: "35px",
        height: "35px",
        background: "linear-gradient(135deg, #ff6b9d 0%, #c44569 100%)",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        fontWeight: "bold",
        fontSize: "16px",
    },
    userGreeting: {
        fontSize: "14px",
        fontWeight: "600",
        color: "#555",
    },
    logoutBtn: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "12px 20px",
        background: "#fff0f0",
        border: "2px solid #ffcccc",
        borderRadius: "12px",
        color: "#c44569",
        fontSize: "14px",
        fontWeight: "600",
        cursor: "pointer",
        transition: "all 0.3s ease",
    },
    // Hero Section
    heroSection: {
        maxWidth: "1400px",
        margin: "0 auto",
        padding: "60px 30px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "50px",
        flexWrap: "wrap",
        position: "relative",
        zIndex: 1,
    },
    heroContent: {
        flex: 1,
        minWidth: "300px",
    },
    heroTitle: {
        fontSize: "48px",
        fontWeight: "800",
        color: "#2d2d2d",
        lineHeight: "1.2",
        marginBottom: "20px",
    },
    heroHighlight: {
        color: "#c44569",
        position: "relative",
    },
    heroSubtitle: {
        fontSize: "18px",
        color: "#666",
        lineHeight: "1.8",
        marginBottom: "30px",
        maxWidth: "500px",
    },
    heroStats: {
        display: "flex",
        alignItems: "center",
        gap: "30px",
        flexWrap: "wrap",
    },
    heroStat: {
        textAlign: "center",
    },
    heroStatNumber: {
        display: "block",
        fontSize: "36px",
        fontWeight: "800",
        color: "#c44569",
    },
    heroStatLabel: {
        fontSize: "14px",
        color: "#888",
        textTransform: "uppercase",
        letterSpacing: "1px",
    },
    heroStatDivider: {
        width: "2px",
        height: "50px",
        background: "rgba(196, 69, 105, 0.2)",
    },
    heroDecoration: {
        position: "relative",
        width: "300px",
        height: "300px",
    },
    heroDecoCircle1: {
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: "200px",
        height: "200px",
        background: "linear-gradient(135deg, rgba(255, 107, 157, 0.2) 0%, rgba(196, 69, 105, 0.2) 100%)",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "80px",
        animation: "pulse 3s ease-in-out infinite",
    },
    heroDecoCircle2: {
        position: "absolute",
        top: "10%",
        right: "10%",
        width: "80px",
        height: "80px",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "35px",
        animation: "float 4s ease-in-out infinite",
        boxShadow: "0 10px 30px rgba(102, 126, 234, 0.4)",
    },
    heroDecoCircle3: {
        position: "absolute",
        bottom: "10%",
        left: "10%",
        width: "70px",
        height: "70px",
        background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "30px",
        animation: "float 5s ease-in-out infinite 1s",
        boxShadow: "0 10px 30px rgba(245, 87, 108, 0.4)",
    },
    // Category Section
    categorySection: {
        maxWidth: "1400px",
        margin: "0 auto",
        padding: "0 30px 40px",
        position: "relative",
        zIndex: 1,
    },
    categorySectionTitle: {
        fontSize: "24px",
        fontWeight: "700",
        color: "#2d2d2d",
        marginBottom: "20px",
        textAlign: "center",
    },
    categoryContainer: {
        display: "flex",
        justifyContent: "center",
        gap: "15px",
        flexWrap: "wrap",
    },
    categoryButton: {
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "15px 25px",
        background: "rgba(255, 255, 255, 0.9)",
        border: "2px solid transparent",
        borderRadius: "50px",
        cursor: "pointer",
        transition: "all 0.3s ease",
        boxShadow: "0 5px 20px rgba(0, 0, 0, 0.08)",
    },
    categoryButtonActive: {
        background: "linear-gradient(135deg, #ff6b9d 0%, #c44569 100%)",
        color: "#fff",
        boxShadow: "0 10px 30px rgba(255, 107, 157, 0.4)",
    },
    categoryIcon: {
        fontSize: "22px",
        color: "#000000"

    },
    categoryName: {
        fontSize: "14px",
        fontWeight: "600",
        color: "#000000"
    },
    // Products Section
    productsSection: {
        maxWidth: "1400px",
        margin: "0 auto",
        padding: "40px 30px",
        position: "relative",
        zIndex: 1,
    },
    productsSectionHeader: {
        marginBottom: "30px",
    },
    sectionTitle: {
        fontSize: "28px",
        fontWeight: "700",
        color: "#2d2d2d",
        marginBottom: "10px",
    },
    productCount: {
        fontSize: "16px",
        fontWeight: "normal",
        color: "#888",
        marginLeft: "10px",
    },
    searchResultText: {
        fontSize: "14px",
        color: "#666",
    },
    productsGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
        gap: "30px",
    },
    productCard: {
        background: "rgba(255, 255, 255, 0.95)",
        borderRadius: "25px",
        overflow: "hidden",
        boxShadow: "0 15px 50px rgba(0, 0, 0, 0.1)",
        transition: "all 0.4s ease",
        animation: "fadeInUp 0.6s ease forwards",
        opacity: 0,
        backdropFilter: "blur(10px)",
    },
    cardHeader: {
        background: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
        padding: "30px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        position: "relative",
    },
    cardIconWrapper: {
        width: "80px",
        height: "80px",
        background: "rgba(255, 255, 255, 0.9)",


        color: "#000000",

        borderRadius: "20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
    },
    cardIcon: {
        fontSize: "45px",
        color: "#000000"

    },
    limitedBadge: {
        background: "linear-gradient(135deg, #f39c12 0%, #e74c3c 100%)",
        color: "#fff",
        padding: "8px 15px",
        borderRadius: "20px",
        fontSize: "12px",
        fontWeight: "600",
    },
    outOfStockBadge: {
        background: "#e74c3c",
        color: "#fff",
        padding: "8px 15px",
        borderRadius: "20px",
        fontSize: "12px",
        fontWeight: "600",
    },
    cardBody: {
        padding: "25px 30px",
    },
    categoryTag: {
        display: "inline-block",
        background: "linear-gradient(135deg, #ff6b9d 0%, #c44569 100%)",
        color: "#fff",
        padding: "6px 15px",
        borderRadius: "20px",
        fontSize: "11px",
        fontWeight: "600",
        textTransform: "uppercase",
        letterSpacing: "1px",
        marginBottom: "12px",
    },
    productName: {
        fontSize: "22px",
        fontWeight: "700",
        color: "#2d2d2d",
        marginBottom: "20px",
    },
    productMeta: {
        display: "flex",
        justifyContent: "space-between",
        marginBottom: "20px",
        padding: "15px",
        background: "#f8f8f8",
        borderRadius: "15px",
    },
    priceSection: {
        textAlign: "center",
    },
    priceLabel: {
        display: "block",
        fontSize: "12px",
        color: "#888",
        marginBottom: "5px",
    },
    priceValue: {
        fontSize: "24px",
        fontWeight: "800",
        color: "#c44569",
    },
    stockSection: {
        textAlign: "center",
    },
    stockLabel: {
        display: "block",
        fontSize: "12px",
        color: "#888",
        marginBottom: "5px",
    },
    stockValue: {
        fontSize: "20px",
        fontWeight: "700",
    },
    quantitySection: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "15px",
    },
    quantityLabel: {
        fontSize: "14px",
        fontWeight: "600",
        color: "#555",
    },
    quantityControls: {
        display: "flex",
        alignItems: "center",
        gap: "5px",
    },
    quantityBtn: {
        width: "40px",
        height: "40px",
        background: "#f0f0f0",
        border: "none",
        borderRadius: "10px",
        fontSize: "20px",
        cursor: "pointer",
        transition: "all 0.3s ease",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    },
    quantityInput: {
        width: "60px",
        height: "40px",
        border: "2px solid #f0f0f0",
        borderRadius: "10px",
        textAlign: "center",
        fontSize: "16px",
        fontWeight: "600",
    },
    totalSection: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "15px",
        background: "linear-gradient(135deg, #f8f0f0 0%, #fff5f5 100%)",
        borderRadius: "12px",
        marginBottom: "15px",
    },
    totalLabel: {
        fontSize: "14px",
        color: "#888",
    },
    totalValue: {
        fontSize: "22px",
        fontWeight: "800",
        color: "#c44569",
    },
    cardActions: {
        display: "flex",
        gap: "10px",
        padding: "0 30px 25px",
    },
    addToCartBtn: {
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        padding: "15px",
        background: "#f0f0f0",
        border: "none",
        borderRadius: "12px",
        fontSize: "14px",
        fontWeight: "600",
        color: "#555",
        cursor: "pointer",
        transition: "all 0.3s ease",
    },
    buyNowBtn: {
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        padding: "15px",
        background: "linear-gradient(135deg, #ff6b9d 0%, #c44569 100%)",
        border: "none",
        borderRadius: "12px",
        fontSize: "14px",
        fontWeight: "600",
        color: "#fff",
        cursor: "pointer",
        transition: "all 0.3s ease",
        boxShadow: "0 5px 20px rgba(255, 107, 157, 0.3)",
    },
    disabledBtn: {
        opacity: 0.5,
        cursor: "not-allowed",
    },
    // Empty State
    emptyState: {
        textAlign: "center",
        padding: "80px 40px",
        background: "rgba(255, 255, 255, 0.9)",
        borderRadius: "25px",
        boxShadow: "0 15px 50px rgba(0, 0, 0, 0.1)",
    },
    emptyIcon: {
        fontSize: "80px",
        display: "block",
        marginBottom: "20px",
    },
    emptyTitle: {
        fontSize: "28px",
        fontWeight: "700",
        color: "#2d2d2d",
        marginBottom: "10px",
    },
    emptyText: {
        fontSize: "16px",
        color: "#888",
        marginBottom: "30px",
    },
    emptyButton: {
        padding: "15px 40px",
        background: "linear-gradient(135deg, #ff6b9d 0%, #c44569 100%)",
        border: "none",
        borderRadius: "12px",
        color: "#fff",
        fontSize: "16px",
        fontWeight: "600",
        cursor: "pointer",
        boxShadow: "0 10px 30px rgba(255, 107, 157, 0.3)",
    },
    // Cart Sidebar
    cartOverlay: {
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0, 0, 0, 0.5)",
        zIndex: 200,
        backdropFilter: "blur(5px)",
    },
    cartSidebar: {
        position: "fixed",
        top: 0,
        right: 0,
        width: "400px",
        maxWidth: "100%",
        height: "100vh",
        background: "#fff",
        boxShadow: "-10px 0 50px rgba(0, 0, 0, 0.2)",
        display: "flex",
        flexDirection: "column",
        animation: "slideInRight 0.3s ease",
    },
    cartHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "25px 30px",
        borderBottom: "1px solid #eee",
        background: "linear-gradient(135deg, #ff6b9d 0%, #c44569 100%)",
    },
    cartTitle: {
        fontSize: "22px",
        fontWeight: "700",
        color: "#fff",
        margin: 0,
    },
    cartCloseBtn: {
        width: "40px",
        height: "40px",
        background: "rgba(255, 255, 255, 0.2)",
        border: "none",
        borderRadius: "50%",
        color: "#fff",
        fontSize: "18px",
        cursor: "pointer",
    },
    emptyCart: {
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px",
    },
    emptyCartIcon: {
        fontSize: "60px",
        marginBottom: "20px",
        opacity: 0.5,
    },
    emptyCartText: {
        fontSize: "16px",
        color: "#888",
        marginBottom: "20px",
    },
    continueShoppingBtn: {
        padding: "12px 30px",
        background: "linear-gradient(135deg, #ff6b9d 0%, #c44569 100%)",
        border: "none",
        borderRadius: "10px",
        color: "#fff",
        fontWeight: "600",
        cursor: "pointer",
    },
    cartItems: {
        flex: 1,
        overflow: "auto",
        padding: "20px",
    },
    cartItem: {
        display: "flex",
        alignItems: "center",
        gap: "15px",
        padding: "15px",
        background: "#f8f8f8",
        borderRadius: "12px",
        marginBottom: "10px",
    },
    cartItemIcon: {
        width: "50px",
        height: "50px",
        background: "#fff",
        borderRadius: "10px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "25px",
    },
    cartItemInfo: {
        flex: 1,
    },
    cartItemName: {
        fontSize: "14px",
        fontWeight: "600",
        color: "#2d2d2d",
        margin: 0,
    },
    cartItemPrice: {
        fontSize: "12px",
        color: "#888",
        margin: "5px 0 0",
    },
    cartItemTotal: {
        fontSize: "16px",
        fontWeight: "700",
        color: "#c44569",
    },
    cartItemRemove: {
        width: "35px",
        height: "35px",
        background: "#fff0f0",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
        fontSize: "16px",
    },
    cartFooter: {
        padding: "20px 30px",
        borderTop: "1px solid #eee",
        background: "#fafafa",
    },
    cartTotal: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "20px",
        fontSize: "18px",
        fontWeight: "600",
    },
    cartTotalValue: {
        fontSize: "26px",
        color: "#c44569",
    },
    checkoutBtn: {
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "10px",
        padding: "18px",
        background: "linear-gradient(135deg, #ff6b9d 0%, #c44569 100%)",
        border: "none",
        borderRadius: "12px",
        color: "#fff",
        fontSize: "16px",
        fontWeight: "700",
        cursor: "pointer",
        boxShadow: "0 10px 30px rgba(255, 107, 157, 0.4)",
    },
    // Footer
    footer: {
        background: "linear-gradient(180deg, #2d2d2d 0%, #1a1a2e 100%)",
        padding: "60px 30px 30px",
        marginTop: "60px",
        position: "relative",
        zIndex: 1,
    },
    footerContent: {
        maxWidth: "1200px",
        margin: "0 auto",
        display: "flex",
        justifyContent: "space-between",
        gap: "50px",
        flexWrap: "wrap",
        marginBottom: "40px",
    },
    footerBrand: {
        maxWidth: "300px",
    },
    footerLogo: {
        fontSize: "50px",
        display: "block",
        marginBottom: "15px",
    },
    footerTitle: {
        fontSize: "24px",
        fontWeight: "700",
        color: "#fff",
        marginBottom: "10px",
    },
    footerTagline: {
        fontSize: "14px",
        color: "rgba(255, 255, 255, 0.6)",
    },
    footerLinks: {
        display: "flex",
        gap: "60px",
        flexWrap: "wrap",
    },
    footerColumn: {
        display: "flex",
        flexDirection: "column",
        gap: "12px",
    },
    footerColumnTitle: {
        fontSize: "16px",
        fontWeight: "600",
        color: "#fff",
        marginBottom: "10px",
    },
    footerLink: {
        color: "rgba(255, 255, 255, 0.6)",
        textDecoration: "none",
        fontSize: "14px",
        transition: "color 0.3s ease",
    },
    socialLinks: {
        display: "flex",
        gap: "15px",
    },
    socialIcon: {
        fontSize: "25px",
        cursor: "pointer",
        transition: "transform 0.3s ease",
    },
    footerBottom: {
        textAlign: "center",
        paddingTop: "30px",
        borderTop: "1px solid rgba(255, 255, 255, 0.1)",
        color: "rgba(255, 255, 255, 0.5)",
        fontSize: "14px",
    },
    // Loading State
    loadingContainer: {
        minHeight: "100vh",
        width: "100vw",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 50%, #ee9ca7 100%)",
    },
    loadingContent: {
        textAlign: "center",
        padding: "40px",
    },
    loadingSpinner: {
        width: "80px",
        height: "80px",
        border: "4px solid rgba(255, 107, 157, 0.2)",
        borderTop: "4px solid #ff6b9d",
        borderRadius: "50%",
        animation: "spin 1s linear infinite",
        margin: "0 auto 30px",
    },
    loadingIconContainer: {
        marginBottom: "20px",
    },
    loadingIcon: {
        fontSize: "70px",
        animation: "pulse 1.5s ease-in-out infinite",
    },
    loadingTitle: {
        fontSize: "32px",
        fontWeight: "700",
        color: "#c44569",
        marginBottom: "10px",
    },
    loadingSubtitle: {
        fontSize: "16px",
        color: "#888",
        marginBottom: "25px",
    },
    loadingDots: {
        display: "flex",
        justifyContent: "center",
        gap: "15px",
    },
    loadingDot: {
        fontSize: "35px",
        animation: "bounce 1s ease-in-out infinite",
    },
    // Error State
    errorContainer: {
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 50%, #ee9ca7 100%)",
    },
    errorContent: {
        textAlign: "center",
        padding: "60px",
        background: "#fff",
        borderRadius: "30px",
        boxShadow: "0 25px 80px rgba(0, 0, 0, 0.15)",
        maxWidth: "450px",
    },
    errorIcon: {
        fontSize: "90px",
        display: "block",
        marginBottom: "25px",
    },
    errorTitle: {
        fontSize: "28px",
        fontWeight: "700",
        color: "#c44569",
        marginBottom: "15px",
    },
    errorMessage: {
        fontSize: "16px",
        color: "#888",
        marginBottom: "30px",
    },
    retryButton: {
        padding: "16px 40px",
        background: "linear-gradient(135deg, #ff6b9d 0%, #c44569 100%)",
        border: "none",
        borderRadius: "12px",
        color: "#fff",
        fontSize: "16px",
        fontWeight: "700",
        cursor: "pointer",
        boxShadow: "0 10px 30px rgba(255, 107, 157, 0.4)",
    },
};

export default Homepage;