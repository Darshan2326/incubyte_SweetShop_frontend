import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const AdminPage = () => {
    const navigate = useNavigate();
    const { isAuthenticated, userRole, logout } = useAuth();
    const [sweets, setSweets] = useState([]);
    const [allSweets, setAllSweets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingSweetId, setEditingSweetId] = useState(null);
    const [activeTab, setActiveTab] = useState("all");
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [searchParams, setSearchParams] = useState({
        category: "",
        low_price: "",
        name: ""
    });
    const [newSweet, setNewSweet] = useState({
        name: "",
        category: "",
        price: "",
        quantity: ""
    });

    // Check authentication status
    useEffect(() => {
        if (!isAuthenticated) {
            // Not authenticated, redirect to login
            navigate("/");
            return;
        }

        // If user is not admin, redirect to homepage
        if (userRole !== "admin") {
            navigate("/homepage");
            return;
        }
    }, [isAuthenticated, userRole, navigate]);

    // Fetch sweets only when authenticated
    useEffect(() => {
        if (!isAuthenticated || userRole !== "admin") return;

        const fetchSweets = async () => {
            try {
                const response = await fetch("/api/sweets");
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
    }, [isAuthenticated, userRole]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewSweet(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSearchParamChange = (e) => {
        const { name, value } = e.target;
        setSearchParams(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            const queryParams = new URLSearchParams();
            if (searchParams.category) queryParams.append('category', searchParams.category);
            if (searchParams.low_price) queryParams.append('low_price', searchParams.low_price);
            if (searchParams.name) queryParams.append('name', searchParams.name);

            if (![searchParams.category, searchParams.low_price, searchParams.name].some(param => param)) {
                setSweets(allSweets);
                return;
            }

            const url = `/api/sweets/search?${queryParams.toString()}`;

            const response = await fetch(url, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            if (!response.ok) {
                throw new Error("Failed to search sweets");
            }
            const data = await response.json();
            setSweets(data);
        } catch (err) {
            alert("Error searching sweets: " + err.message);
        }
    };

    const handleClearSearch = () => {
        setSearchParams({ category: "", low_price: "", name: "" });
        setSweets(allSweets);
    };

    const handleAddSweet = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            const response = await fetch("/api/sweets/addSweets", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: newSweet.name,
                    category: newSweet.category,
                    price: parseFloat(newSweet.price),
                    quantity: parseInt(newSweet.quantity)
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || "Failed to add sweet");
            }

            const addedSweet = await response.json();
            const formattedSweet = {
                _id: addedSweet._id || Date.now().toString(),
                name: addedSweet.name || newSweet.name || "Unnamed Sweet",
                category: addedSweet.category || newSweet.category || "Uncategorized",
                price: (typeof addedSweet.price === 'number') ? addedSweet.price : parseFloat(newSweet.price) || 0,
                quantity: (typeof addedSweet.quantity === 'number') ? addedSweet.quantity : parseInt(newSweet.quantity) || 0,
                last_action: addedSweet.last_action || null,
                history: addedSweet.history || [],
                createdAt: addedSweet.createdAt || new Date().toISOString(),
                updatedAt: addedSweet.updatedAt || new Date().toISOString()
            };

            setSweets(prev => [...prev, formattedSweet]);
            setAllSweets(prev => [...prev, formattedSweet]);
            setNewSweet({ name: "", category: "", price: "", quantity: "" });
            setShowAddForm(false);
        } catch (err) {
            alert("Error adding sweet: " + err.message);
        }
    };

    const handleUpdateSweet = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`/update/${editingSweetId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: newSweet.name,
                    category: newSweet.category,
                    price: parseFloat(newSweet.price)
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || "Failed to update sweet");
            }

            const updatedSweet = await response.json();
            if (updatedSweet && typeof updatedSweet === 'object') {
                const formattedSweet = {
                    _id: updatedSweet._id || editingSweetId,
                    name: updatedSweet.name || newSweet.name,
                    category: updatedSweet.category || newSweet.category,
                    price: (typeof updatedSweet.price === 'number') ? updatedSweet.price : parseFloat(newSweet.price) || 0,
                    quantity: (typeof updatedSweet.quantity === 'number') ? updatedSweet.quantity : 0,
                    last_action: updatedSweet.last_action || null,
                    history: updatedSweet.history || [],
                    createdAt: updatedSweet.createdAt || new Date().toISOString(),
                    updatedAt: updatedSweet.updatedAt || new Date().toISOString()
                };

                setSweets(prev =>
                    prev.map(sweet => sweet._id === editingSweetId ? formattedSweet : sweet)
                );
                setAllSweets(prev =>
                    prev.map(sweet => sweet._id === editingSweetId ? formattedSweet : sweet)
                );
            }

            setEditingSweetId(null);
            setNewSweet({ name: "", category: "", price: "", quantity: "" });
            setShowAddForm(false);
        } catch (err) {
            alert("Error updating sweet: " + err.message);
        }
    };

    const handleDeleteSweet = async (id) => {
        if (!window.confirm("Are you sure you want to delete this sweet?")) return;

        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`/delete/${id}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (response.ok || response.status === 200 || response.status === 204) {
                setSweets(prev => prev.filter(sweet => sweet._id !== id));
                setAllSweets(prev => prev.filter(sweet => sweet._id !== id));
                return;
            }

            let errorMessage = "Failed to delete sweet";
            try {
                const errorData = await response.json();
                errorMessage = errorData.message || errorMessage;
            } catch (e) {
                // Ignore JSON parse error
            }

            throw new Error(errorMessage);
        } catch (err) {
            alert("Error deleting sweet: " + err.message);
        }
    };

    const handleRestockSweet = async (id, restoreQuantity) => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`/api/sweets/${id}/restock?restoreQuantity=${restoreQuantity}`, {
                method: "POST", // Changed from PUT to POST to match typical REST patterns
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (response.ok || response.status === 200) {
                const updatedSweet = await response.json();

                // Update the sweet in state
                setSweets(prev => prev.map(sweet =>
                    sweet._id === id ? { ...sweet, quantity: updatedSweet.quantity } : sweet
                ));
                setAllSweets(prev => prev.map(sweet =>
                    sweet._id === id ? { ...sweet, quantity: updatedSweet.quantity } : sweet
                ));

                return;
            }

            let errorMessage = "Failed to restock sweet";
            try {
                const errorData = await response.json();
                errorMessage = errorData.message || errorMessage;
            } catch (e) {
                // Ignore JSON parse error
            }

            throw new Error(errorMessage);
        } catch (err) {
            alert("Error restocking sweet: " + err.message);
        }
    };

    const startEditing = (sweet) => {
        setEditingSweetId(sweet._id);
        setNewSweet({
            name: sweet.name,
            category: sweet.category,
            price: sweet.price,
            quantity: sweet.quantity
        });
        setShowAddForm(true);
    };

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    // Calculate statistics
    const totalSweets = sweets.length;
    const totalStock = sweets.reduce((acc, sweet) => acc + (sweet.quantity || 0), 0);
    const totalValue = sweets.reduce((acc, sweet) => acc + ((sweet.price || 0) * (sweet.quantity || 0)), 0);
    const lowStockItems = sweets.filter(sweet => (sweet.quantity || 0) < 10).length;
    const categories = [...new Set(sweets.map(sweet => sweet.category))];

    if (loading) {
        return (
            <div style={styles.loadingContainer}>
                <div style={styles.loadingContent}>
                    <div style={styles.loadingSpinner}></div>
                    <div style={styles.loadingIconContainer}>
                        <span style={styles.loadingIcon}>🍰</span>
                    </div>
                    <h2 style={styles.loadingTitle}>Loading Sweet Delights...</h2>
                    <p style={styles.loadingSubtitle}>Preparing your dashboard</p>
                    <div style={styles.loadingDots}>
                        <span style={{ ...styles.loadingDot, animationDelay: '0s' }}>🍬</span>
                        <span style={{ ...styles.loadingDot, animationDelay: '0.2s' }}>🍩</span>
                        <span style={{ ...styles.loadingDot, animationDelay: '0.4s' }}>🧁</span>
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

            {/* Sidebar */}
            <aside style={{
                ...styles.sidebar,
                width: sidebarCollapsed ? '80px' : '280px'
            }}>
                <div style={styles.sidebarHeader}>
                    <div style={styles.logoContainer}>
                        <span style={styles.logoIcon}>🍰</span>
                    </div>
                    {!sidebarCollapsed && (
                        <div style={styles.logoText}>
                            <h1 style={styles.logoTitle}>Sweet Delights</h1>
                            <p style={styles.logoSubtitle}>Admin Panel</p>
                        </div>
                    )}
                </div>

                <button
                    style={styles.collapseButton}
                    onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                >
                    {sidebarCollapsed ? '→' : '←'}
                </button>

                <nav style={styles.sidebarNav}>
                    <button
                        style={{
                            ...styles.navItem,
                            ...(activeTab === 'all' ? styles.navItemActive : {})
                        }}
                        onClick={() => setActiveTab('all')}
                    >
                        <span style={styles.navIcon}>📦</span>
                        {!sidebarCollapsed && <span>All Products</span>}
                    </button>
                    <button
                        style={{
                            ...styles.navItem,
                            ...(activeTab === 'lowstock' ? styles.navItemActive : {})
                        }}
                        onClick={() => setActiveTab('lowstock')}
                    >
                        <span style={styles.navIcon}>⚠️</span>
                        {!sidebarCollapsed && <span>Low Stock</span>}
                        {!sidebarCollapsed && lowStockItems > 0 && (
                            <span style={styles.badge}>{lowStockItems}</span>
                        )}
                    </button>
                    <button
                        style={styles.navItem}
                        onClick={() => {
                            setEditingSweetId(null);
                            setNewSweet({ name: "", category: "", price: "", quantity: "" });
                            setShowAddForm(true);
                        }}
                    >
                        <span style={styles.navIcon}>➕</span>
                        {!sidebarCollapsed && <span>Add Sweet</span>}
                    </button>
                </nav>

                {!sidebarCollapsed && (

                    <div style={styles.sidebarFooter}>

                        <div style={styles.userInfo}>
                            <div style={styles.userAvatar}>👨‍💼</div>
                            <div style={styles.userDetails}>
                                <p style={styles.userName}>Admin User</p>
                                <p style={styles.userRole}>Manager</p>
                            </div>
                        </div>
                        <button
                            style={styles.logoutButton}
                            onClick={handleLogout}
                        >
                            🚪 Logout
                        </button>

                    </div>
                )}
            </aside>

            {/* Main Content */}
            <main style={{
                ...styles.mainContent,
                marginLeft: sidebarCollapsed ? '80px' : '280px'
            }}>
                {/* Header */}
                <header style={styles.header}>
                    <div style={styles.headerLeft}>
                        <h1 style={styles.pageTitle}>
                            {activeTab === 'all' ? '🍬 Product Inventory' : '⚠️ Low Stock Items'}
                        </h1>
                        <p style={styles.pageSubtitle}>
                            Manage your sweet shop products with ease
                        </p>
                    </div>
                    <div style={styles.headerRight}>
                        <div style={styles.dateTime}>
                            <span style={styles.dateIcon}>📅</span>
                            <span>{new Date().toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}</span>
                        </div>
                    </div>
                </header>

                {/* Stats Cards */}
                <div style={styles.statsContainer}>
                    <div style={{ ...styles.statCard, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                        <div style={styles.statIcon}>📦</div>
                        <div style={styles.statInfo}>
                            <h3 style={styles.statValue}>{totalSweets}</h3>
                            <p style={styles.statLabel}>Total Products</p>
                        </div>
                        <div style={styles.statDecoration}>🍬</div>
                    </div>
                    <div style={{ ...styles.statCard, background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
                        <div style={styles.statIcon}>📊</div>
                        <div style={styles.statInfo}>
                            <h3 style={styles.statValue}>{totalStock}</h3>
                            <p style={styles.statLabel}>Total Stock</p>
                        </div>
                        <div style={styles.statDecoration}>🧁</div>
                    </div>
                    <div style={{ ...styles.statCard, background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
                        <div style={styles.statIcon}>💰</div>
                        <div style={styles.statInfo}>
                            <h3 style={styles.statValue}>${totalValue.toFixed(2)}</h3>
                            <p style={styles.statLabel}>Inventory Value</p>
                        </div>
                        <div style={styles.statDecoration}>💎</div>
                    </div>
                    <div style={{ ...styles.statCard, background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' }}>
                        <div style={styles.statIcon}>🏷️</div>
                        <div style={styles.statInfo}>
                            <h3 style={styles.statValue}>{categories.length}</h3>
                            <p style={styles.statLabel}>Categories</p>
                        </div>
                        <div style={styles.statDecoration}>🍩</div>
                    </div>
                </div>

                {/* Search Section */}
                <div style={styles.searchSection}>
                    <div style={styles.searchHeader}>
                        <h2 style={styles.searchTitle}>🔍 Search & Filter</h2>
                        <button
                            style={styles.toggleSearchBtn}
                            onClick={handleClearSearch}
                        >
                            Clear Filters
                        </button>
                    </div>
                    <form onSubmit={handleSearch} style={styles.searchForm}>
                        <div style={styles.searchInputGroup}>
                            <label style={styles.searchLabel}>
                                <span style={styles.searchLabelIcon}>🏷️</span> Name
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={searchParams.name}
                                onChange={handleSearchParamChange}
                                placeholder="Search by name..."
                                style={styles.searchInput}
                            />
                        </div>
                        <div style={styles.searchInputGroup}>
                            <label style={styles.searchLabel}>
                                <span style={styles.searchLabelIcon}>📁</span> Category
                            </label>
                            <input
                                type="text"
                                name="category"
                                value={searchParams.category}
                                onChange={handleSearchParamChange}
                                placeholder="Filter by category..."
                                style={styles.searchInput}
                            />
                        </div>
                        <div style={styles.searchInputGroup}>
                            <label style={styles.searchLabel}>
                                <span style={styles.searchLabelIcon}>💵</span> Min Price
                            </label>
                            <input
                                type="number"
                                name="low_price"
                                value={searchParams.low_price}
                                onChange={handleSearchParamChange}
                                placeholder="Minimum price..."
                                min="0"
                                step="0.01"
                                style={styles.searchInput}
                            />
                        </div>
                        <button type="submit" style={styles.searchButton}>
                            <span>🔍</span> Search
                        </button>
                    </form>
                </div>

                {/* Add/Edit Modal */}
                {showAddForm && (
                    <div style={styles.modalOverlay} onClick={() => setShowAddForm(false)}>
                        <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
                            <div style={styles.modalHeader}>
                                <h2 style={styles.modalTitle}>
                                    {editingSweetId ? '✏️ Update Sweet' : '🍬 Add New Sweet'}
                                </h2>
                                <button
                                    style={styles.modalClose}
                                    onClick={() => setShowAddForm(false)}
                                >
                                    ✕
                                </button>
                            </div>
                            <form onSubmit={editingSweetId ? handleUpdateSweet : handleAddSweet} style={styles.modalForm}>
                                <div style={styles.formGroup}>
                                    <label style={styles.formLabel}>
                                        <span style={styles.formLabelIcon}>🍰</span> Sweet Name
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={newSweet.name}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="Enter sweet name..."
                                        style={styles.formInput}
                                    />
                                </div>
                                <div style={styles.formGroup}>
                                    <label style={styles.formLabel}>
                                        <span style={styles.formLabelIcon}>📁</span> Category
                                    </label>
                                    <input
                                        type="text"
                                        name="category"
                                        value={newSweet.category}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="Enter category..."
                                        style={styles.formInput}
                                    />
                                </div>
                                <div style={styles.formRow}>
                                    <div style={styles.formGroup}>
                                        <label style={styles.formLabel}>
                                            <span style={styles.formLabelIcon}>💰</span> Price ($)
                                        </label>
                                        <input
                                            type="number"
                                            name="price"
                                            value={newSweet.price}
                                            onChange={handleInputChange}
                                            required
                                            min="0"
                                            step="0.01"
                                            placeholder="0.00"
                                            style={styles.formInput}
                                        />
                                    </div>
                                    {!editingSweetId && (
                                        <div style={styles.formGroup}>
                                            <label style={styles.formLabel}>
                                                <span style={styles.formLabelIcon}>📊</span> Quantity
                                            </label>
                                            <input
                                                type="number"
                                                name="quantity"
                                                value={newSweet.quantity}
                                                onChange={handleInputChange}
                                                required
                                                min="0"
                                                placeholder="0"
                                                style={styles.formInput}
                                            />
                                        </div>
                                    )}
                                </div>
                                <div style={styles.modalActions}>
                                    <button
                                        type="button"
                                        style={styles.cancelButton}
                                        onClick={() => setShowAddForm(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button type="submit" style={styles.submitButton}>
                                        {editingSweetId ? '✨ Update Sweet' : '🎉 Add Sweet'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Products Grid */}
                <div style={styles.productsSection}>
                    <div style={styles.productsSectionHeader}>
                        <h2 style={styles.sectionTitle}>
                            🍭 {activeTab === 'all' ? 'All Products' : 'Low Stock Products'}
                            <span style={styles.productCount}>
                                ({activeTab === 'all' ? sweets.length : sweets.filter(s => (s.quantity || 0) < 10).length} items)
                            </span>
                        </h2>
                        <button
                            style={styles.addProductBtn}
                            onClick={() => {
                                setEditingSweetId(null);
                                setNewSweet({ name: "", category: "", price: "", quantity: "" });
                                setShowAddForm(true);
                            }}
                        >
                            <span>➕</span> Add New Sweet
                        </button>
                    </div>

                    {sweets.length === 0 ? (
                        <div style={styles.emptyState}>
                            <span style={styles.emptyIcon}>🍬</span>
                            <h3 style={styles.emptyTitle}>No sweets found</h3>
                            <p style={styles.emptyText}>Start by adding some delicious treats!</p>
                            <button
                                style={styles.emptyButton}
                                onClick={() => setShowAddForm(true)}
                            >
                                ➕ Add Your First Sweet
                            </button>
                        </div>
                    ) : (
                        <div style={styles.productsGrid}>
                            {(activeTab === 'all' ? sweets : sweets.filter(s => (s.quantity || 0) < 10)).map((sweet, index) => (
                                <div
                                    key={sweet._id}
                                    style={{
                                        ...styles.productCard,
                                        animationDelay: `${index * 0.1}s`
                                    }}
                                >
                                    <div style={styles.cardHeader}>
                                        <div style={styles.cardIconContainer}>
                                            <span style={styles.cardIcon}>
                                                {getCategoryIcon(sweet.category)}
                                            </span>
                                        </div>
                                        <button
                                            style={styles.deleteBtn}
                                            onClick={() => handleDeleteSweet(sweet._id)}
                                            title="Delete"
                                        >
                                            🗑️
                                        </button>
                                    </div>

                                    <div style={styles.cardBody}>
                                        <h3 style={styles.productName}>{sweet.name}</h3>
                                        <span style={styles.categoryBadge}>{sweet.category}</span>

                                        <div style={styles.productStats}>
                                            <div style={styles.productStat}>
                                                <span style={styles.statEmoji}>💰</span>
                                                <div>
                                                    <p style={styles.productStatValue}>
                                                        ${typeof sweet.price === 'number' ? sweet.price.toFixed(2) : "0.00"}
                                                    </p>
                                                    <p style={styles.productStatLabel}>Price</p>
                                                </div>
                                            </div>
                                            <div style={styles.productStat}>
                                                <span style={styles.statEmoji}>📦</span>
                                                <div>
                                                    <p style={{
                                                        ...styles.productStatValue,
                                                        color: (sweet.quantity || 0) < 10 ? '#e74c3c' : '#27ae60'
                                                    }}>
                                                        {sweet.quantity !== undefined ? sweet.quantity : 0}
                                                    </p>
                                                    <p style={styles.productStatLabel}>In Stock</p>
                                                </div>
                                            </div>
                                        </div>

                                        {(sweet.quantity || 0) < 10 && (
                                            <div style={styles.lowStockWarning}>
                                                ⚠️ Low Stock Alert!
                                            </div>
                                        )}
                                    </div>

                                    <div style={styles.cardActions}>
                                        <button
                                            style={styles.editBtn}
                                            onClick={() => startEditing(sweet)}
                                        >
                                            ✏️ Edit
                                        </button>
                                        <div style={styles.restockGroup}>
                                            <input
                                                type="number"
                                                min="1"
                                                defaultValue="10"
                                                id={`restock-${sweet._id}`}
                                                style={styles.restockInput}
                                            />
                                            <button
                                                style={styles.restockBtn}
                                                onClick={() => {
                                                    const input = document.getElementById(`restock-${sweet._id}`);
                                                    handleRestockSweet(sweet._id, input.value);
                                                }}
                                            >
                                                📦 Restock
                                            </button>
                                        </div>
                                    </div>

                                    {sweet.last_action && (
                                        <div style={styles.lastAction}>
                                            <span style={styles.lastActionIcon}>📝</span>
                                            <span style={styles.lastActionText}>
                                                {sweet.last_action.type} of {sweet.last_action.quantity} by {sweet.last_action.by}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            <style>{keyframes}</style>
        </div>
    );
};

// Helper function to get category icon
const getCategoryIcon = (category) => {
    const categoryLower = (category || '').toLowerCase();
    if (categoryLower.includes('cake')) return '🎂';
    if (categoryLower.includes('chocolate')) return '🍫';
    if (categoryLower.includes('candy')) return '🍬';
    if (categoryLower.includes('donut') || categoryLower.includes('doughnut')) return '🍩';
    if (categoryLower.includes('cookie')) return '🍪';
    if (categoryLower.includes('ice')) return '🍦';
    if (categoryLower.includes('cupcake')) return '🧁';
    if (categoryLower.includes('pie')) return '🥧';
    if (categoryLower.includes('pastry')) return '🥐';
    return '🍰';
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
    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateX(-20px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
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
`;

const styles = {
    container: {
        minHeight: "100vh",
        width: "100vw",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        background: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 50%, #ee9ca7 100%)",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        position: "relative",
        overflow: "hidden",
    },
    // Floating candies
    floatingCandy1: {
        position: "fixed",
        top: "10%",
        left: "2%",
        fontSize: "30px",
        animation: "float 3s ease-in-out infinite",
        opacity: "0.6",
        zIndex: 0,
    },
    floatingCandy2: {
        position: "fixed",
        top: "30%",
        right: "3%",
        fontSize: "25px",
        animation: "float 4s ease-in-out infinite 0.5s",
        opacity: "0.6",
        zIndex: 0,
    },
    floatingCandy3: {
        position: "fixed",
        bottom: "20%",
        left: "5%",
        fontSize: "35px",
        animation: "float 3.5s ease-in-out infinite 1s",
        opacity: "0.6",
        zIndex: 0,
    },
    floatingCandy4: {
        position: "fixed",
        bottom: "30%",
        right: "5%",
        fontSize: "28px",
        animation: "float 4.5s ease-in-out infinite 0.3s",
        opacity: "0.6",
        zIndex: 0,
    },
    floatingCandy5: {
        position: "fixed",
        top: "60%",
        left: "3%",
        fontSize: "22px",
        animation: "float 5s ease-in-out infinite 0.7s",
        opacity: "0.5",
        zIndex: 0,
    },
    floatingCandy6: {
        position: "fixed",
        top: "80%",
        right: "8%",
        fontSize: "26px",
        animation: "float 3.8s ease-in-out infinite 1.2s",
        opacity: "0.5",
        zIndex: 0,
    },
    // Sidebar
    sidebar: {
        position: "fixed",
        top: 0,
        left: 0,
        height: "100vh",
        background: "linear-gradient(180deg, #2d2d2d 0%, #1a1a2e 100%)",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        zIndex: 100,
        transition: "width 0.3s ease",
        boxShadow: "5px 0 30px rgba(0, 0, 0, 0.2)",
    },

    sidebarHeader: {
        display: "flex",
        alignItems: "center",
        gap: "15px",
        marginBottom: "30px",
        paddingBottom: "20px",
        borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
    },
    logoContainer: {
        width: "50px",
        height: "50px",
        background: "linear-gradient(135deg, #ff6b9d 0%, #c44569 100%)",
        borderRadius: "15px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        animation: "pulse 2s ease-in-out infinite",
    },
    logoIcon: {
        fontSize: "28px",
    },
    logoText: {
        color: "#fff",
    },
    logoTitle: {
        fontSize: "18px",
        fontWeight: "700",
        margin: 0,
    },
    logoSubtitle: {
        fontSize: "12px",
        opacity: "0.7",
        margin: 0,
    },
    collapseButton: {
        position: "absolute",
        top: "20px",
        right: "-15px",
        width: "30px",
        height: "30px",
        background: "#ff6b9d",
        color: "#fff",
        border: "none",
        borderRadius: "50%",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "14px",
        fontWeight: "bold",
        boxShadow: "0 5px 15px rgba(255, 107, 157, 0.4)",
    },
    sidebarNav: {
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        flex: 1,
    },
    navItem: {
        display: "flex",
        alignItems: "center",
        gap: "15px",
        padding: "15px",
        background: "transparent",
        border: "none",
        borderRadius: "12px",
        color: "rgba(255, 255, 255, 0.7)",
        cursor: "pointer",
        transition: "all 0.3s ease",
        fontSize: "14px",
        fontWeight: "500",
        textAlign: "left",
    },
    navItemActive: {
        background: "linear-gradient(135deg, #ff6b9d 0%, #c44569 100%)",
        color: "#fff",
        boxShadow: "0 5px 20px rgba(255, 107, 157, 0.3)",
    },
    navIcon: {
        fontSize: "20px",
    },
    badge: {
        marginLeft: "auto",
        background: "#e74c3c",
        color: "#fff",
        padding: "2px 8px",
        borderRadius: "10px",
        fontSize: "12px",
        fontWeight: "bold",
    },
    sidebarFooter: {
        borderTop: "1px solid rgba(255, 255, 255, 0.1)",
        paddingTop: "20px",

    },
    userInfo: {
        display: "flex",
        alignItems: "center",
        gap: "12px",
        marginBottom: "15px",
    },
    userAvatar: {
        width: "45px",
        height: "45px",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        borderRadius: "12px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "22px",
    },
    userDetails: {
        color: "#fff",
    },
    userName: {
        margin: 0,
        fontSize: "14px",
        fontWeight: "600",
    },
    userRole: {
        margin: 0,
        fontSize: "12px",
        opacity: "0.7",
    },
    logoutButton: {
        width: "100%",
        padding: "12px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",

        background: "rgba(231, 76, 60, 0.2)",
        border: "1px solid rgba(231, 76, 60, 0.3)",
        borderRadius: "10px",
        color: "#e74c3c",
        cursor: "pointer",
        fontSize: "14px",
        fontWeight: "500",
        transition: "all 0.3s ease",
    },
    // Main Content
    mainContent: {
        minHeight: "100vh",
        padding: "30px",
        transition: "margin-left 0.3s ease",
        position: "relative",
        zIndex: 1,
    },
    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "30px",
        flexWrap: "wrap",
        gap: "20px",
    },
    headerLeft: {},
    pageTitle: {
        fontSize: "32px",
        fontWeight: "800",
        color: "#2d2d2d",
        margin: "0 0 5px 0",
    },
    pageSubtitle: {
        fontSize: "16px",
        color: "#666",
        margin: 0,
    },
    headerRight: {},
    dateTime: {
        display: "flex",
        alignItems: "center",
        gap: "10px",
        background: "rgba(255, 255, 255, 0.9)",
        padding: "12px 20px",
        borderRadius: "12px",
        boxShadow: "0 5px 20px rgba(0, 0, 0, 0.1)",
        color: "#555",
        fontSize: "14px",
    },
    dateIcon: {
        fontSize: "18px",
    },
    // Stats
    statsContainer: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
        gap: "20px",
        marginBottom: "30px",
    },
    statCard: {
        padding: "25px",
        borderRadius: "20px",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        gap: "15px",
        position: "relative",
        overflow: "hidden",
        boxShadow: "0 10px 40px rgba(0, 0, 0, 0.15)",
        animation: "fadeInUp 0.6s ease forwards",
    },
    statIcon: {
        width: "60px",
        height: "60px",
        background: "rgba(255, 255, 255, 0.2)",
        borderRadius: "15px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "28px",
    },
    statInfo: {
        flex: 1,
    },
    statValue: {
        fontSize: "28px",
        fontWeight: "800",
        margin: 0,
    },
    statLabel: {
        fontSize: "14px",
        opacity: "0.9",
        margin: 0,
    },
    statDecoration: {
        position: "absolute",
        right: "15px",
        bottom: "10px",
        fontSize: "50px",
        opacity: "0.2",
    },
    // Search Section
    searchSection: {
        background: "rgba(255, 255, 255, 0.95)",
        borderRadius: "20px",
        padding: "25px",
        marginBottom: "30px",
        boxShadow: "0 10px 40px rgba(0, 0, 0, 0.1)",
        backdropFilter: "blur(10px)",
    },
    searchHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "20px",
    },
    searchTitle: {
        fontSize: "20px",
        fontWeight: "700",
        color: "#2d2d2d",
        margin: 0,
    },
    toggleSearchBtn: {
        background: "#f8f0f0",
        border: "none",
        padding: "10px 20px",
        borderRadius: "10px",
        color: "#c44569",
        cursor: "pointer",
        fontWeight: "600",
        fontSize: "14px",
    },
    searchForm: {
        display: "flex",
        gap: "15px",
        flexWrap: "wrap",
        alignItems: "flex-end",
    },
    searchInputGroup: {
        flex: "1",
        minWidth: "200px",
    },
    searchLabel: {
        display: "flex",
        alignItems: "center",
        gap: "5px",
        fontSize: "13px",
        fontWeight: "600",
        color: "#555",
        marginBottom: "8px",
    },
    searchLabelIcon: {
        fontSize: "14px",
    },
    searchInput: {
        width: "100%",
        padding: "14px 18px",
        border: "2px solid #eee",
        borderRadius: "12px",
        fontSize: "14px",
        background: "#fafafa",
        transition: "all 0.3s ease",
        outline: "none",
        boxSizing: "border-box",
        color: "#000000",
    },
    searchButton: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "14px 25px",
        background: "linear-gradient(135deg, #ff6b9d 0%, #c44569 100%)",
        border: "none",
        borderRadius: "12px",
        color: "#fff",
        cursor: "pointer",
        fontWeight: "600",
        fontSize: "14px",
        boxShadow: "0 5px 20px rgba(255, 107, 157, 0.3)",
        transition: "all 0.3s ease",
    },
    // Modal
    modalOverlay: {
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0, 0, 0, 0.6)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
        backdropFilter: "blur(5px)",
    },
    modal: {
        background: "#fff",
        borderRadius: "25px",
        width: "90%",
        maxWidth: "500px",
        maxHeight: "90vh",
        overflow: "auto",
        boxShadow: "0 25px 80px rgba(0, 0, 0, 0.3)",
        animation: "fadeInUp 0.3s ease",
    },
    modalHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "25px 30px",
        borderBottom: "1px solid #eee",
        background: "linear-gradient(135deg, #ff6b9d 0%, #c44569 100%)",
        borderRadius: "25px 25px 0 0",
    },
    modalTitle: {
        fontSize: "22px",
        fontWeight: "700",
        color: "#fff",
        margin: 0,
    },
    modalClose: {
        width: "40px",
        height: "40px",
        background: "rgba(255, 255, 255, 0.2)",
        border: "none",
        borderRadius: "50%",
        color: "#fff",
        cursor: "pointer",
        fontSize: "18px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    },
    modalForm: {
        padding: "30px",
        display: "flex",
        flexDirection: "column",
        gap: "20px",
    },
    formGroup: {
        display: "flex",
        flexDirection: "column",
        gap: "8px",
    },
    formLabel: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        fontSize: "14px",
        fontWeight: "600",
        color: "#333",
    },
    formLabelIcon: {
        fontSize: "16px",
    },
    formInput: {
        padding: "15px 18px",
        border: "2px solid #eee",
        borderRadius: "12px",
        fontSize: "15px",
        background: "#fafafa",
        transition: "all 0.3s ease",
        outline: "none",
        color: "#000000",
    },
    formRow: {
        display: "flex",
        gap: "15px",
    },
    modalActions: {
        display: "flex",
        gap: "15px",
        marginTop: "10px",
    },
    cancelButton: {
        flex: 1,
        padding: "15px",
        background: "#f0f0f0",
        border: "none",
        borderRadius: "12px",
        color: "#666",
        cursor: "pointer",
        fontWeight: "600",
        fontSize: "15px",
    },
    submitButton: {
        flex: 2,
        padding: "15px",
        background: "linear-gradient(135deg, #ff6b9d 0%, #c44569 100%)",
        border: "none",
        borderRadius: "12px",
        color: "#fff",
        cursor: "pointer",
        fontWeight: "700",
        fontSize: "15px",
        boxShadow: "0 5px 20px rgba(255, 107, 157, 0.3)",
    },
    // Products Section
    productsSection: {
        background: "rgba(255, 255, 255, 0.95)",
        borderRadius: "25px",
        padding: "30px",
        boxShadow: "0 10px 40px rgba(0, 0, 0, 0.1)",
    },
    productsSectionHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "25px",
        flexWrap: "wrap",
        gap: "15px",
    },
    sectionTitle: {
        fontSize: "24px",
        fontWeight: "700",
        color: "#2d2d2d",
        margin: 0,
    },
    productCount: {
        fontSize: "16px",
        fontWeight: "normal",
        color: "#888",
        marginLeft: "10px",
    },
    addProductBtn: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "12px 25px",
        background: "linear-gradient(135deg, #ff6b9d 0%, #c44569 100%)",
        border: "none",
        borderRadius: "12px",
        color: "#fff",
        cursor: "pointer",
        fontWeight: "600",
        fontSize: "14px",
        boxShadow: "0 5px 20px rgba(255, 107, 157, 0.3)",
    },
    // Products Grid
    productsGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
        gap: "25px",
    },
    productCard: {
        background: "#fff",
        borderRadius: "20px",
        padding: "25px",
        boxShadow: "0 10px 40px rgba(0, 0, 0, 0.08)",
        border: "1px solid #f0f0f0",
        transition: "all 0.3s ease",
        animation: "fadeInUp 0.5s ease forwards",
        opacity: 0,
    },
    cardHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: "15px",
    },
    cardIconContainer: {
        width: "60px",
        height: "60px",
        background: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
        borderRadius: "15px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    },
    cardIcon: {
        fontSize: "32px",
    },
    deleteBtn: {
        width: "40px",
        height: "40px",
        background: "#fff0f0",
        border: "none",
        borderRadius: "12px",
        cursor: "pointer",
        fontSize: "18px",
        transition: "all 0.3s ease",
    },
    cardBody: {
        marginBottom: "20px",
    },
    productName: {
        fontSize: "20px",
        fontWeight: "700",
        color: "#2d2d2d",
        margin: "0 0 10px 0",
    },
    categoryBadge: {
        display: "inline-block",
        padding: "6px 14px",
        background: "linear-gradient(135deg, #ff6b9d 0%, #c44569 100%)",
        color: "#fff",
        borderRadius: "20px",
        fontSize: "12px",
        fontWeight: "600",
        textTransform: "uppercase",
        letterSpacing: "0.5px",
    },
    productStats: {
        display: "flex",
        gap: "30px",
        marginTop: "20px",
        padding: "15px",
        background: "#f8f8f8",
        borderRadius: "12px",
    },
    productStat: {
        display: "flex",
        alignItems: "center",
        gap: "10px",
    },
    statEmoji: {
        fontSize: "24px",
    },
    productStatValue: {
        fontSize: "20px",
        fontWeight: "700",
        color: "#2d2d2d",
        margin: 0,
    },
    productStatLabel: {
        fontSize: "12px",
        color: "#888",
        margin: 0,
    },
    lowStockWarning: {
        marginTop: "15px",
        padding: "10px 15px",
        background: "linear-gradient(135deg, #fff3cd 0%, #ffeeba 100%)",
        borderRadius: "10px",
        color: "#856404",
        fontSize: "13px",
        fontWeight: "600",
        textAlign: "center",
    },
    cardActions: {
        display: "flex",
        gap: "10px",
        paddingTop: "20px",
        borderTop: "1px dashed #eee",
    },
    editBtn: {
        padding: "12px 20px",
        background: "#f0f0f0",
        border: "none",
        borderRadius: "10px",
        color: "#555",
        cursor: "pointer",
        fontWeight: "600",
        fontSize: "13px",
        transition: "all 0.3s ease",
    },
    restockGroup: {
        display: "flex",
        gap: "8px",
        flex: 1,
    },
    restockInput: {
        width: "70px",
        padding: "12px",
        border: "2px solid #eee",
        borderRadius: "10px",
        fontSize: "14px",
        textAlign: "center",
        // color: "#000000",
    },
    restockBtn: {
        flex: 1,
        padding: "12px 15px",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        border: "none",
        borderRadius: "10px",
        color: "#fff",
        cursor: "pointer",
        fontWeight: "600",
        fontSize: "13px",
        boxShadow: "0 5px 15px rgba(102, 126, 234, 0.3)",
    },
    lastAction: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        marginTop: "15px",
        padding: "10px 15px",
        background: "#f8f8f8",
        borderRadius: "10px",
    },
    lastActionIcon: {
        fontSize: "16px",
    },
    lastActionText: {
        fontSize: "12px",
        color: "#666",
    },
    // Empty State
    emptyState: {
        textAlign: "center",
        padding: "60px 20px",
    },
    emptyIcon: {
        fontSize: "80px",
        display: "block",
        marginBottom: "20px",
        animation: "bounce 2s ease-in-out infinite",
    },
    emptyTitle: {
        fontSize: "24px",
        fontWeight: "700",
        color: "#2d2d2d",
        margin: "0 0 10px 0",
    },
    emptyText: {
        fontSize: "16px",
        color: "#888",
        margin: "0 0 25px 0",
    },
    emptyButton: {
        padding: "15px 30px",
        background: "linear-gradient(135deg, #ff6b9d 0%, #c44569 100%)",
        border: "none",
        borderRadius: "12px",
        color: "#fff",
        cursor: "pointer",
        fontWeight: "700",
        fontSize: "16px",
        boxShadow: "0 10px 30px rgba(255, 107, 157, 0.3)",
    },
    // Loading State
    // loadingContainer: {
    //     minHeight: "100vh",
    //     height: "100vh",
    //     maxWidth: "100vh",
    //     maxHeight: "100vh",
    //     overflow: "hidden",
    //     position: "relative",

    //     width: "100vh",



    //     display: "flex",
    //     flexDirection: "column",
    //     justifyContent: "center",
    //     alignItems: "center",
    //     background: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 50%, #ee9ca7 100%)",
    // },
    loadingContainer: {
        minHeight: "100vh",
        width: "100vw",
        overflow: "hidden",
        position: "relative",

        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",

        background: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 50%, #ee9ca7 100%)",
    },
    loadingContent: {
        textAlign: "center",
        height: "100vh",
        width: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
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
        fontSize: "60px",
        animation: "pulse 1.5s ease-in-out infinite",
    },
    loadingTitle: {
        fontSize: "28px",
        fontWeight: "700",
        color: "#c44569",
        margin: "0 0 10px 0",
    },
    loadingSubtitle: {
        fontSize: "16px",
        color: "#888",
        margin: "0 0 20px 0",
    },
    loadingDots: {
        display: "flex",
        justifyContent: "center",
        gap: "15px",
    },
    loadingDot: {
        fontSize: "30px",
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
        padding: "50px",
        background: "#fff",
        borderRadius: "25px",
        boxShadow: "0 20px 60px rgba(0, 0, 0, 0.15)",
        maxWidth: "400px",
    },
    errorIcon: {
        fontSize: "80px",
        display: "block",
        marginBottom: "20px",
    },
    errorTitle: {
        fontSize: "24px",
        fontWeight: "700",
        color: "#c44569",
        margin: "0 0 10px 0",
    },
    errorMessage: {
        fontSize: "16px",
        color: "#888",
        margin: "0 0 25px 0",
    },
    retryButton: {
        padding: "15px 30px",
        background: "linear-gradient(135deg, #ff6b9d 0%, #c44569 100%)",
        border: "none",
        borderRadius: "12px",
        color: "#fff",
        cursor: "pointer",
        fontWeight: "700",
        fontSize: "16px",
        boxShadow: "0 10px 30px rgba(255, 107, 157, 0.3)",
    },
};

export default AdminPage;