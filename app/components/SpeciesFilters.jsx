'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getFilterOptions } from '@/lib/api';

// Advanced filtering component for species catalog
export default function SpeciesFilters({ 
    currentStatus, 
    currentSearch, 
    currentPage, 
    currentEstado, 
    currentReino, 
    currentFilo, 
    currentClase, 
    currentOrden, 
    currentFamilia 
}) {
    // Search and filter state variables
    const [searchTerm, setSearchTerm] = useState(currentSearch || '');
    const [selectedStatus, setSelectedStatus] = useState(currentStatus || '');
    const [selectedEstado, setSelectedEstado] = useState(currentEstado || '');
    const [selectedReino, setSelectedReino] = useState(currentReino || '');
    const [selectedFilo, setSelectedFilo] = useState(currentFilo || '');
    const [selectedClase, setSelectedClase] = useState(currentClase || '');
    const [selectedOrden, setSelectedOrden] = useState(currentOrden || '');
    const [selectedFamilia, setSelectedFamilia] = useState(currentFamilia || '');
    // UI state
    const [isSearching, setIsSearching] = useState(false);
    const [isFiltersOpen, setIsFiltersOpen] = useState(false);
    // Available options for each filter dropdown
    const [filterOptions, setFilterOptions] = useState({
        estados: [],
        reino: [],
        filo: [],
        clase: [],
        orden: [],
        familia: [],
        status: []
    });

    // Load filter options from API on component mount
    useEffect(() => {
        const loadFilterOptions = async () => {
            const options = await getFilterOptions();
            setFilterOptions(options);
        };
        loadFilterOptions();
    }, []);

    // Handle search form submission
    const handleSearch = (e) => {
        e.preventDefault();
        setIsSearching(true);
        const params = new URLSearchParams();
        if (searchTerm.trim()) params.set('search', searchTerm.trim());
        if (selectedStatus) params.set('status', selectedStatus);
        if (selectedEstado) params.set('estado', selectedEstado);
        if (selectedReino) params.set('reino', selectedReino);
        if (selectedFilo) params.set('filo', selectedFilo);
        if (selectedClase) params.set('clase', selectedClase);
        if (selectedOrden) params.set('orden', selectedOrden);
        if (selectedFamilia) params.set('familia', selectedFamilia);
        
        const href = `/catalog${params.toString() ? '?' + params.toString() : ''}`;
        window.location.href = href;
    };

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedStatus('');
        setSelectedEstado('');
        setSelectedReino('');
        setSelectedFilo('');
        setSelectedClase('');
        setSelectedOrden('');
        setSelectedFamilia('');
        window.location.href = '/catalog';
    };

    const getStatusBadgeColor = (status) => {
        switch (status) {
            case 'Critically Endangered': return 'bg-danger';
            case 'Endangered': return 'bg-warning text-dark';
            case 'Vulnerable': return 'bg-info';
            case 'Near Threatened': return 'bg-warning text-dark';
            case 'Least Concern': return 'bg-success';
            case 'Data Deficient': return 'bg-secondary';
            case 'Extinct': return 'bg-dark';
            case 'Extinct in the Wild': return 'bg-dark';
            default: return 'bg-secondary';
        }
    };

    // Count active filters
    const activeFilterCount = [selectedStatus, selectedEstado, selectedReino, selectedFilo, selectedClase, selectedOrden, selectedFamilia].filter(f => f).length;

    return (
        <>
            <style>{`
                @keyframes slideDown {
                    from {
                        opacity: 0;
                        max-height: 0;
                    }
                    to {
                        opacity: 1;
                        max-height: 1000px;
                    }
                }
                
                .search-card {
                    background: linear-gradient(135deg, rgba(76, 175, 80, 0.05) 0%, rgba(102, 187, 106, 0.05) 100%);
                    border: 2px solid rgba(85, 139, 47, 0.3);
                    border-radius: 12px;
                    transition: all 0.3s ease;
                }
                
                .search-card:hover {
                    border-color: rgba(85, 139, 47, 0.6);
                    box-shadow: 0 0.5rem 1.5rem rgba(85, 139, 47, 0.15);
                }
                
                .search-input {
                    border: none;
                    background: white;
                    font-size: 1.1rem;
                    font-weight: 500;
                }
                
                .search-input::placeholder {
                    color: #9CCC65;
                }
                
                .search-input:focus {
                    background: white;
                    box-shadow: none;
                    outline: none;
                }
                
                .btn-search {
                    background: linear-gradient(135deg, #558B2F 0%, #33691E 100%);
                    border: none;
                    color: white;
                    font-weight: 600;
                    transition: all 0.3s ease;
                }
                
                .btn-search:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 0.5rem 1.5rem rgba(85, 139, 47, 0.3);
                }
                
                .btn-filters-toggle {
                    border: 2px solid #558B2F;
                    color: #558B2F;
                    font-weight: 600;
                    transition: all 0.3s ease;
                    border-radius: 8px;
                }
                
                .btn-filters-toggle:hover {
                    background: #558B2F;
                    color: white;
                    transform: translateY(-2px);
                    box-shadow: 0 0.5rem 1.5rem rgba(85, 139, 47, 0.25);
                }
                
                .filters-panel {
                    background: linear-gradient(135deg, rgba(76, 175, 80, 0.03) 0%, rgba(102, 187, 106, 0.03) 100%);
                    border: 2px solid rgba(85, 139, 47, 0.2);
                    border-radius: 12px;
                    animation: slideDown 0.4s ease;
                }
                
                .form-select, .form-control {
                    border: 2px solid rgba(85, 139, 47, 0.2);
                    transition: all 0.3s ease;
                    border-radius: 8px;
                }
                
                .form-select:focus, .form-control:focus {
                    border-color: #558B2F;
                    box-shadow: 0 0 0 0.2rem rgba(85, 139, 47, 0.15);
                }
                
                .form-label {
                    color: #1B5E20;
                    font-size: 0.95rem;
                    font-weight: 600;
                }
                
                .badge {
                    padding: 0.5rem 1rem;
                    border-radius: 20px;
                    font-size: 0.85rem;
                    font-weight: 600;
                }
            `}</style>

            {/* Search Bar - Always Visible */}
            <div className="search-card mb-3 p-3 p-md-4">
                <form onSubmit={handleSearch}>
                    <div className="input-group input-group-lg">
                        <span className="input-group-text" style={{ background: 'white', border: 'none', color: '#558B2F' }}>
                            <i className="bi bi-search" style={{ fontSize: '1.3rem' }}></i>
                        </span>
                        <input
                            type="text"
                            className="form-control search-input"
                            placeholder="Search by scientific or common name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <button className="btn btn-search" type="submit" disabled={isSearching}>
                            <i className="bi bi-search me-2"></i>Search
                        </button>
                    </div>
                </form>
            </div>

            {/* Filter Menu Toggle */}
            <div className="mb-3 d-flex gap-2 align-items-center flex-wrap">
                <button 
                    className="btn btn-filters-toggle"
                    onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                >
                    <i className={`bi ${isFiltersOpen ? 'bi-funnel-fill' : 'bi-funnel'} me-2`}></i>
                    Advanced Filters
                    {activeFilterCount > 0 && (
                        <span className="badge bg-danger ms-2" style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}>{activeFilterCount}</span>
                    )}
                </button>
                {activeFilterCount > 0 && (
                    <button 
                        className="btn btn-outline-danger btn-sm"
                        onClick={clearFilters}
                        style={{ borderRadius: '8px', fontWeight: '600' }}
                    >
                        <i className="bi bi-x-circle me-1"></i>Clear All
                    </button>
                )}
            </div>

            {/* Collapsible Filters Panel */}
            {isFiltersOpen && (
                <div className="filters-panel mb-4 p-4">
                        <form onSubmit={handleSearch}>
                            <div className="row g-3">
                                {/* Status Filter */}
                                <div className="col-12 col-md-6">
                                    <label htmlFor="statusFilter" className="form-label fw-semibold">
                                        <i className="bi bi-shield-check me-2"></i>
                                        Conservation Status
                                    </label>
                                    <select
                                        className="form-select"
                                        id="statusFilter"
                                        value={selectedStatus}
                                        onChange={(e) => setSelectedStatus(e.target.value)}
                                    >
                                        <option value="">All Statuses</option>
                                        {filterOptions.status && filterOptions.status.map((status) => (
                                            <option key={status} value={status}>
                                                {status}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Estado Filter */}
                                <div className="col-12 col-md-6">
                                    <label htmlFor="estadoFilter" className="form-label fw-semibold">
                                        <i className="bi bi-geo-alt me-2"></i>
                                        State
                                    </label>
                                    <select
                                        className="form-select"
                                        id="estadoFilter"
                                        value={selectedEstado}
                                        onChange={(e) => setSelectedEstado(e.target.value)}
                                    >
                                        <option value="">All States</option>
                                        {filterOptions.estados && filterOptions.estados.map((estado) => (
                                            <option key={estado} value={estado}>
                                                {estado.charAt(0).toUpperCase() + estado.slice(1)}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Reino Filter */}
                                <div className="col-12 col-md-6">
                                    <label htmlFor="reinoFilter" className="form-label fw-semibold">
                                        <i className="bi bi-diagram-3 me-2"></i>
                                        Kingdom
                                    </label>
                                    <select
                                        className="form-select"
                                        id="reinoFilter"
                                        value={selectedReino}
                                        onChange={(e) => setSelectedReino(e.target.value)}
                                    >
                                        <option value="">All Kingdoms</option>
                                        {filterOptions.reino && filterOptions.reino.map((reino) => (
                                            <option key={reino} value={reino}>
                                                {reino}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Filo Filter */}
                                <div className="col-12 col-md-6">
                                    <label htmlFor="filoFilter" className="form-label fw-semibold">
                                        <i className="bi bi-diagram-3 me-2"></i>
                                        Phylum
                                    </label>
                                    <select
                                        className="form-select"
                                        id="filoFilter"
                                        value={selectedFilo}
                                        onChange={(e) => setSelectedFilo(e.target.value)}
                                    >
                                        <option value="">All Phyla</option>
                                        {filterOptions.filo && filterOptions.filo.map((filo) => (
                                            <option key={filo} value={filo}>
                                                {filo}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Clase Filter */}
                                <div className="col-12 col-md-6">
                                    <label htmlFor="claseFilter" className="form-label fw-semibold">
                                        <i className="bi bi-diagram-3 me-2"></i>
                                        Class
                                    </label>
                                    <select
                                        className="form-select"
                                        id="claseFilter"
                                        value={selectedClase}
                                        onChange={(e) => setSelectedClase(e.target.value)}
                                    >
                                        <option value="">All Classes</option>
                                        {filterOptions.clase && filterOptions.clase.map((clase) => (
                                            <option key={clase} value={clase}>
                                                {clase}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Orden Filter */}
                                <div className="col-12 col-md-6">
                                    <label htmlFor="ordenFilter" className="form-label fw-semibold">
                                        <i className="bi bi-diagram-3 me-2"></i>
                                        Order
                                    </label>
                                    <select
                                        className="form-select"
                                        id="ordenFilter"
                                        value={selectedOrden}
                                        onChange={(e) => setSelectedOrden(e.target.value)}
                                    >
                                        <option value="">All Orders</option>
                                        {filterOptions.orden && filterOptions.orden.map((orden) => (
                                            <option key={orden} value={orden}>
                                                {orden}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Familia Filter */}
                                <div className="col-12 col-md-6">
                                    <label htmlFor="familiaFilter" className="form-label fw-semibold">
                                        <i className="bi bi-diagram-3 me-2"></i>
                                        Family
                                    </label>
                                    <select
                                        className="form-select"
                                        id="familiaFilter"
                                        value={selectedFamilia}
                                        onChange={(e) => setSelectedFamilia(e.target.value)}
                                    >
                                        <option value="">All Families</option>
                                        {filterOptions.familia && filterOptions.familia.map((familia) => (
                                            <option key={familia} value={familia}>
                                                {familia}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Active Filters Display */}
                            {(searchTerm || selectedStatus || selectedEstado || selectedReino || selectedFilo || selectedClase || selectedOrden || selectedFamilia) && (
                                <div className="mt-4">
                                    <div className="d-flex flex-wrap gap-2">
                                        {searchTerm && (
                                            <span className="badge bg-info p-2">
                                                <i className="bi bi-search me-1"></i>
                                                Search: {searchTerm}
                                            </span>
                                        )}
                                        {selectedStatus && (
                                            <span className={`badge ${getStatusBadgeColor(selectedStatus)} p-2`}>
                                                <i className="bi bi-shield-check me-1"></i>
                                                {selectedStatus}
                                            </span>
                                        )}
                                        {selectedEstado && (
                                            <span className="badge bg-success p-2">
                                                <i className="bi bi-geo-alt me-1"></i>
                                                {selectedEstado.charAt(0).toUpperCase() + selectedEstado.slice(1)}
                                            </span>
                                        )}
                                        {selectedReino && (
                                            <span className="badge bg-secondary p-2">
                                                <i className="bi bi-diagram-3 me-1"></i>
                                                Kingdom: {selectedReino}
                                            </span>
                                        )}
                                        {selectedFilo && (
                                            <span className="badge bg-secondary p-2">
                                                <i className="bi bi-diagram-3 me-1"></i>
                                                Phylum: {selectedFilo}
                                            </span>
                                        )}
                                        {selectedClase && (
                                            <span className="badge bg-secondary p-2">
                                                <i className="bi bi-diagram-3 me-1"></i>
                                                Class: {selectedClase}
                                            </span>
                                        )}
                                        {selectedOrden && (
                                            <span className="badge bg-secondary p-2">
                                                <i className="bi bi-diagram-3 me-1"></i>
                                                Order: {selectedOrden}
                                            </span>
                                        )}
                                        {selectedFamilia && (
                                            <span className="badge bg-secondary p-2">
                                                <i className="bi bi-diagram-3 me-1"></i>
                                                Family: {selectedFamilia}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Filter Buttons */}
                            <div className="mt-4 d-flex gap-2 flex-wrap">
                                <button type="submit" className="btn btn-primary btn-sm" disabled={isSearching}>
                                    <i className="bi bi-check-circle me-1"></i>
                                    Apply Filters
                                </button>
                                {activeFilterCount > 0 && (
                                    <button type="button" className="btn btn-outline-secondary btn-sm" onClick={clearFilters}>
                                        <i className="bi bi-x-circle me-1"></i>
                                        Clear All
                                    </button>
                                )}
                            </div>
                        </form>
                </div>
            )}

        </>
    );
}
