import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Filter, Briefcase, Clock, Building } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

interface Job {
  _id: string;
  title: string;
  company: string;
  location: string;
  domain: string;
  position: string;
  salary: number;
  type: string;
  duration: string;
  description: string;
  createdAt: string;
}

interface Pagination {
  current: number;
  pages: number;
  total: number;
}

// Determine API base URL based on environment
const getApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;

    // Local development
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:5006/api';
    }

    // Production URLs
    if (hostname === 'internx.cc' || hostname === 'www.internx.cc') {
      return 'https://api.internx.cc/api';
    }

    // Vercel/Netlify deployments
    if (hostname.includes('vercel.app') || hostname.includes('netlify.app')) {
      return 'https://api.internx.cc/api';
    }

    // Default to localhost for development
    return 'http://localhost:5006/api';
  }

  return 'http://localhost:5006/api';
};

const API_BASE_URL = getApiBaseUrl();

/**
 * useDebounce - returns a stable debounced function
 * Usage: const debounced = useDebounce(fn, 300); debounced(args)
 */
const useDebounce = <T extends (...args: any[]) => void>(fn: T, delay = 300) => {
  const timeoutRef = useRef<number | null>(null);

  // Keep stable reference to fn
  const fnRef = useRef(fn);
  useEffect(() => {
    fnRef.current = fn;
  }, [fn]);

  const debounced = useCallback((...args: Parameters<T>) => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }
    // @ts-ignore - window.setTimeout returns number
    timeoutRef.current = window.setTimeout(() => {
      fnRef.current(...args);
    }, delay);
  }, [delay]);

  // cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, []);

  return debounced;
};

// Add highlighting component
const HighlightedText = ({ text, highlight }: { text: string; highlight: string }) => {
  if (!highlight.trim()) {
    return <span>{text}</span>;
  }

  const searchTerms = highlight.trim().split(/\s+/);
  let highlightedText = text;

  searchTerms.forEach(term => {
    const safeTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(\\b${safeTerm}\\b)`, 'gi');
    highlightedText = highlightedText.replace(regex, '<mark class="bg-yellow-200 px-1 rounded">$1</mark>');
  });

  return <span dangerouslySetInnerHTML={{ __html: highlightedText }} />;
};

const Internships: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<Pagination>({ current: 1, pages: 1, total: 0 });
  const [filters, setFilters] = useState({
    search: '',
    location: '',
    domain: '',
    position: '',
    minSalary: '',
    maxSalary: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  // autocomplete state
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([]);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState<number>(-1);

  // refs for keyboard handling & clicks outside
  const locInputRef = useRef<HTMLInputElement | null>(null);
  const suggestionsRef = useRef<HTMLUListElement | null>(null);
// --- Domain autocomplete state ---
const [domainSuggestions, setDomainSuggestions] = useState<string[]>([]);
const [showDomainSuggestions, setShowDomainSuggestions] = useState(false);
const [activeDomainIndex, setActiveDomainIndex] = useState<number>(-1);

// refs for domain dropdown
const domainInputRef = useRef<HTMLInputElement | null>(null);
const domainSuggestionsRef = useRef<HTMLUListElement | null>(null);

  // Debounced functions
  // 1) Search debounce triggers fetching actual jobs (server query)
  const fetchJobs = useCallback(async (page = pagination.current) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.set(key, value);
      });
      params.set('page', page.toString());
      params.set('limit', '12');

      const response = await axios.get(`${API_BASE_URL}/jobs?${params.toString()}`);
      setJobs(response.data.jobs || []);
      setPagination(response.data.pagination || { current: page, pages: 1, total: 0 });
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast.error('Failed to fetch internships');
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.current]);

  const debouncedFetchJobs = useDebounce((p = 1) => fetchJobs(p), 500);

  // 2) Location suggestions (typed)
  const fetchLocationSuggestions = useCallback(async (q: string) => {
    if (!q.trim()) {
      setLocationSuggestions([]);
      setShowLocationSuggestions(false);
      return;
    }
    try {
      const response = await axios.get(`${API_BASE_URL}/jobs`, {
        params: { autocomplete: 'true', location: q }
      });
      const suggestions: string[] = response.data.suggestions || [];
      setLocationSuggestions(suggestions);
      setShowLocationSuggestions(suggestions.length > 0);
      setActiveSuggestionIndex(-1);
    } catch (err) {
      console.error('Error fetching location suggestions', err);
      setLocationSuggestions([]);
      setShowLocationSuggestions(false);
    }
  }, []);

  const debouncedFetchLocationSuggestions = useDebounce(fetchLocationSuggestions, 300);
// --- Domain suggestions (typed) ---
const fetchDomainSuggestions = useCallback(async (q: string) => {
  if (!q.trim()) {
    setDomainSuggestions([]);
    setShowDomainSuggestions(false);
    return;
  }
  try {
    const response = await axios.get(`${API_BASE_URL}/jobs`, {
      params: { autocomplete: 'true', domain: q }
    });
    const suggestions: string[] = response.data.suggestions || [];
    setDomainSuggestions(suggestions);
    setShowDomainSuggestions(suggestions.length > 0);
    setActiveDomainIndex(-1);
  } catch (err) {
    console.error('Error fetching domain suggestions', err);
    setDomainSuggestions([]);
    setShowDomainSuggestions(false);
  }
}, []);

const debouncedFetchDomainSuggestions = useDebounce(fetchDomainSuggestions, 300);

  // initial load & refetch when filters or page changes
const [initialized, setInitialized] = useState(false);



useEffect(() => {
  if (initialized) {
    fetchJobs(pagination.current);
  }
}, [initialized, pagination.current, filters]);

  // read URL params once on mount
useEffect(() => {
  const urlParams = new URLSearchParams(window.location.search);

  const newFilters = {
    search: urlParams.get('search') || '',
    location: urlParams.get('location') || '',
    domain: urlParams.get('domain') || '',
    position: urlParams.get('position') || '',
    minSalary: urlParams.get('minSalary') || '',
    maxSalary: urlParams.get('maxSalary') || ''
  };

  const page = parseInt(urlParams.get('page') || '1');

  setFilters(newFilters);
  setPagination(prev => ({ ...prev, current: page }));

  // ✅ ADD THIS LINE (VERY IMPORTANT)
  setInitialized(true);

}, []);

  // click outside to close suggestions
useEffect(() => {
  function handleClickOutside(e: MouseEvent) {
    const target = e.target as Node;
    if (suggestionsRef.current && suggestionsRef.current.contains(target)) return;
    if (locInputRef.current && locInputRef.current.contains(target)) return;
    if (domainSuggestionsRef.current && domainSuggestionsRef.current.contains(target)) return;
    if (domainInputRef.current && domainInputRef.current.contains(target)) return;
    setShowLocationSuggestions(false);
    setShowDomainSuggestions(false);
  }
  document.addEventListener('mousedown', handleClickOutside);
  return () => document.removeEventListener('mousedown', handleClickOutside);
}, []);


  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, current: 1 }));
    fetchJobs(1);
  };

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, current: page }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      location: '',
      domain: '',
      position: '',
      minSalary: '',
      maxSalary: ''
    });
    setPagination(prev => ({ ...prev, current: 1 }));
    fetchJobs(1);
  };

  // location selection (from suggestion click or keyboard enter)
  const chooseLocation = (loc: string) => {
    handleFilterChange('location', loc);
    setShowLocationSuggestions(false);
    setLocationSuggestions([]);
    setPagination(prev => ({ ...prev, current: 1 }));
    fetchJobs(1);
  };

  // keyboard nav for suggestions
  const onLocationKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showLocationSuggestions) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveSuggestionIndex(i => Math.min(i + 1, locationSuggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveSuggestionIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeSuggestionIndex >= 0 && locationSuggestions[activeSuggestionIndex]) {
        chooseLocation(locationSuggestions[activeSuggestionIndex]);
      } else {
        // if no suggestion active, run full search
        handleSearch();
        setShowLocationSuggestions(false);
      }
    } else if (e.key === 'Escape') {
      setShowLocationSuggestions(false);
    }
  };
// --- Choose Domain suggestion ---
const chooseDomain = (d: string) => {
  handleFilterChange('domain', d);
  setShowDomainSuggestions(false);
  setDomainSuggestions([]);
  setPagination(prev => ({ ...prev, current: 1 }));
  fetchJobs(1);
};

// --- Keyboard navigation for Domain ---
const onDomainKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
  if (!showDomainSuggestions) return;
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    setActiveDomainIndex(i => Math.min(i + 1, domainSuggestions.length - 1));
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    setActiveDomainIndex(i => Math.max(i - 1, 0));
  } else if (e.key === 'Enter') {
    e.preventDefault();
    if (activeDomainIndex >= 0 && domainSuggestions[activeDomainIndex]) {
      chooseDomain(domainSuggestions[activeDomainIndex]);
    } else {
      handleSearch();
      setShowDomainSuggestions(false);
    }
  } else if (e.key === 'Escape') {
    setShowDomainSuggestions(false);
  }
};

  // Generate pagination numbers with ellipsis
  const getPaginationNumbers = () => {
    const { current, pages } = pagination;
    const items: (number | '...')[] = [];

    if (pages <= 7) {
      for (let i = 1; i <= pages; i++) items.push(i);
    } else {
      items.push(1);
      if (current <= 4) {
        for (let i = 2; i <= 5; i++) items.push(i);
        items.push('...');
        items.push(pages);
      } else if (current >= pages - 3) {
        items.push('...');
        for (let i = pages - 4; i <= pages; i++) items.push(i);
      } else {
        items.push('...');
        for (let i = current - 1; i <= current + 1; i++) items.push(i);
        items.push('...');
        items.push(pages);
      }
    }
    return items;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Your Perfect Internship</h1>
          <p className="text-gray-600">Discover amazing opportunities from top companies</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          {/* Main Search */}
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            {/* Keywords */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search by keywords (e.g., 'Digital Marketing', 'Technology', 'Sales')"
                value={filters.search}
                onChange={(e) => {
                  const value = e.target.value;
                  handleFilterChange('search', value);
                  if (value.trim()) {
                    debouncedFetchJobs(1);
                  } else {
                    setPagination(prev => ({ ...prev, current: 1 }));
                    fetchJobs(1);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch();
                  }
                }}
                className="w-full pl-12 pr-10 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              {filters.search && (
                <button
                  onClick={() => {
                    handleFilterChange('search', '');
                    setPagination(prev => ({ ...prev, current: 1 }));
                    fetchJobs(1);
                  }}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Clear search"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </div>

            {/* Location */}
            <div className="flex-1 relative">
              <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                ref={locInputRef}
                type="text"
                placeholder="Location (e.g., 'Mumbai', 'Bangalore', 'Delhi')"
                value={filters.location}
                onChange={(e) => {
                  const value = e.target.value;
                  handleFilterChange('location', value);
                  if (value.trim()) {
                    debouncedFetchLocationSuggestions(value);
                  } else {
                    setShowLocationSuggestions(false);
                    setLocationSuggestions([]);
                  }
                }}
                onKeyDown={onLocationKeyDown}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    // Enter handled in onLocationKeyDown; this ensures search when suggestions hidden
                    if (!showLocationSuggestions) {
                      handleSearch();
                    }
                  }
                }}
                className="w-full pl-12 pr-10 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                onFocus={() => {
                  if (locationSuggestions.length) setShowLocationSuggestions(true);
                }}
                autoComplete="off"
              />

              {filters.location && (
                <button
                  onClick={() => {
                    handleFilterChange('location', '');
                    setPagination(prev => ({ ...prev, current: 1 }));
                    fetchJobs(1);
                    setShowLocationSuggestions(false);
                  }}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Clear location"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              )}

              {/* Location suggestions dropdown */}
              {showLocationSuggestions && locationSuggestions.length > 0 && (
                <ul
                  ref={suggestionsRef}
                  className="absolute left-0 right-0 mt-2 z-50 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto"
                  role="listbox"
                >
                  {locationSuggestions.map((s, idx) => (
                    <li
                      key={`${s}-${idx}`}
                      onMouseDown={(e) => e.preventDefault()} // prevent blur before click
                      onClick={() => chooseLocation(s)}
                      onMouseEnter={() => setActiveSuggestionIndex(idx)}
                      className={`px-4 py-2 cursor-pointer ${idx === activeSuggestionIndex ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
                      aria-selected={idx === activeSuggestionIndex}
                    >
                      {s}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <button
              onClick={handleSearch}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-semibold transition-colors"
            >
              Search
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="border border-gray-300 hover:border-green-500 text-gray-700 px-6 py-3 rounded-xl font-medium transition-colors flex items-center"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="border-t border-gray-200 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
           <div className="relative">
  <label className="block text-sm font-medium text-gray-700 mb-2">Domain</label>
  <input
    ref={domainInputRef}
    type="text"
    placeholder="e.g., Technology, Marketing"
    value={filters.domain}
    onChange={(e) => {
      const val = e.target.value;
      handleFilterChange('domain', val);
      if (val.trim()) {
        debouncedFetchDomainSuggestions(val);
      } else {
        setShowDomainSuggestions(false);
        setDomainSuggestions([]);
      }
    }}
    onKeyDown={onDomainKeyDown}
    onKeyPress={(e) => {
      if (e.key === 'Enter') {
        if (!showDomainSuggestions) handleSearch();
      }
    }}
    onFocus={() => { if (domainSuggestions.length) setShowDomainSuggestions(true); }}
    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
    autoComplete="off"
  />

  {/* Clear domain button */}
  {filters.domain && (
    <button
      onClick={() => {
        handleFilterChange('domain', '');
        setPagination(prev => ({ ...prev, current: 1 }));
        fetchJobs(1);
        setShowDomainSuggestions(false);
      }}
      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
      title="Clear domain"
    >
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
      </svg>
    </button>
  )}

  {/* Domain suggestions dropdown */}
  {showDomainSuggestions && domainSuggestions.length > 0 && (
    <ul
      ref={domainSuggestionsRef}
      className="absolute left-0 right-0 mt-2 z-50 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto"
      role="listbox"
    >
      {domainSuggestions.map((d, idx) => (
        <li
          key={`${d}-${idx}`}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => chooseDomain(d)}
          onMouseEnter={() => setActiveDomainIndex(idx)}
          className={`px-4 py-2 cursor-pointer ${idx === activeDomainIndex ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
          aria-selected={idx === activeDomainIndex}
        >
          {d}
        </li>
      ))}
    </ul>
  )}
</div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Position</label>
                  <input
                    type="text"
                    placeholder="e.g., Developer, Intern"
                    value={filters.position}
                    onChange={(e) => handleFilterChange('position', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Min Salary ()</label>
                  <input
                    type="number"
                    placeholder="5000"
                    value={filters.minSalary}
                    onChange={(e) => handleFilterChange('minSalary', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Salary ()</label>
                  <input
                    type="number"
                    placeholder="50000"
                    value={filters.maxSalary}
                    onChange={(e) => handleFilterChange('maxSalary', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex gap-4 mt-4">
                <button
                  onClick={handleSearch}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  Apply Filters
                </button>
                <button
                  onClick={clearFilters}
                  className="border border-gray-300 hover:border-red-500 text-gray-700 hover:text-red-600 px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  Clear All
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p className="text-gray-600">
            {filters.search || filters.location ? (
              <>
                Showing <span className="font-semibold">{jobs.length}</span> of{' '}
                <span className="font-semibold">{pagination.total}</span> internships
                {filters.search && (
                  <> matching <span className="font-semibold bg-gray-100 px-2 py-1 rounded">"{filters.search}"</span></>
                )}
                {filters.location && (
                  <> in <span className="font-semibold bg-blue-100 px-2 py-1 rounded">{filters.location}</span></>
                )}
              </>
            ) : (
              <>
                Showing <span className="font-semibold">{jobs.length}</span> of{' '}
                <span className="font-semibold">{pagination.total}</span> internships
              </>
            )}
          </p>

          {(filters.search || filters.location) && (
  <div className="text-sm text-gray-500 flex flex-wrap gap-2">
    {filters.search && (
      <span>
        🔍 Searching in title & domain for: "{filters.search}"
      </span>
    )}
    {filters.location && (
      <span>📍 Location: "{filters.location}"</span>
    )}
  </div>
)}
        </div>

        {/* Jobs Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-12">
            <Briefcase className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No internships found</h3>
            <p className="text-gray-600">Try adjusting your search filters to find more opportunities</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {jobs.map((job) => (
              <div key={job._id} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-start justify-between mb-4">
                  <div className="bg-green-100 p-3 rounded-xl">
                    <Briefcase className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                      {job.type}
                    </span>
                    <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                      <HighlightedText text={job.domain} highlight={filters.search} />
                    </span>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  <HighlightedText text={job.title} highlight={filters.search} />
                </h3>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-gray-600">
                    <Building className="h-4 w-4 mr-2" />
                    <span className="text-sm">{job.company}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span className="text-sm">
                      <HighlightedText text={job.location} highlight={filters.location} />
                    </span>
                  </div>

                  <div className="flex items-center text-gray-600">
                    <Clock className="h-4 w-4 mr-2" />
                    <span className="text-sm">{job.duration}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                  <div className="flex items-center text-green-600">
                    <span className="text-lg font-bold">{job.salary.toLocaleString()}</span>
                  </div>
                  <Link
                    to={{
                      pathname: `/internships/${job._id}`,
                      search: `?page=${pagination.current}&search=${filters.search}&location=${filters.location}&domain=${filters.domain}&position=${filters.position}&minSalary=${filters.minSalary}&maxSalary=${filters.maxSalary}`
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex justify-center items-center space-x-2 flex-wrap">
            <button
              onClick={() => handlePageChange(pagination.current - 1)}
              disabled={pagination.current === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            {getPaginationNumbers().map((item, index) => (
              <React.Fragment key={index}>
                {item === '...' ? (
                  <span className="px-2 py-2 text-gray-500">...</span>
                ) : (
                  <button
                    onClick={() => handlePageChange(item as number)}
                    className={`px-4 py-2 rounded-lg font-medium ${item === pagination.current
                      ? 'bg-green-600 text-white'
                      : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                  >
                    {item}
                  </button>
                )}
              </React.Fragment>
            ))}

            <button
              onClick={() => handlePageChange(pagination.current + 1)}
              disabled={pagination.current === pagination.pages}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Internships;
