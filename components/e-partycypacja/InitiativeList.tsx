'use client'
import { useState, useEffect } from 'react';
import { Search, PlusCircle } from 'lucide-react';
import InitiativeCard from './InitiativeCard';
import { Initiative, SortOption, FilterCategory } from '@/lib/types/initiatives';
import Link from 'next/link';

// Updated to match JSON:API format
interface JsonApiInitiative {
  type: string;
  id: string;
  attributes: {
    title: string;
    description: string;
    status: string;
    'created-at': string;
    'updated-at': string;
    'author-name': string;
    'comments-count': number;
    'votes-count': number;
    'user-has-voted': boolean;
    'user-vote-value': number;
  };
  relationships: {
    tags: {
      meta: { count: number };
      data: Array<{ type: string; id: string }>;
    };
    comments: {
      meta: { count: number };
      data: Array<{ type: string; id: string }>;
    };
  };
}

interface JsonApiResponse {
  data: JsonApiInitiative[];
  included: Array<{
    type: string;
    id: string;
    attributes: any;
  }>;
  meta?: {
    'page-count': number;
    'total-count': number;
  };
  links?: {
    self: string;
    first: string;
    last: string;
    next?: string;
    prev?: string;
  };
}

const InitiativeList: React.FC = () => {
  // State
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [filterCategory, setFilterCategory] = useState<FilterCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [initiatives, setInitiatives] = useState<Initiative[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Map sortBy to API ordering param
  const getOrderingParam = (): string => {
    switch (sortBy) {
      case 'newest':
        return '-created_at';
      case 'oldest':
        return 'created_at';
      case 'popular':
        return '-votes_count';
      case 'mostCommented':
        return '-comments_count';
      case 'mostSupported':
        return '-votes_count';
      default:
        return '-created_at';
    }
  };

  // Build query params for API request
  const buildQueryParams = (): URLSearchParams => {
    const params = new URLSearchParams();

    // Add ordering
    params.append('ordering', getOrderingParam());

    // Add category filter if not 'all'
    if (filterCategory !== 'all') {
      params.append('tags_list', filterCategory);
    }

    // Add search query if present
    if (searchQuery) {
      params.append('author_name', searchQuery);
      // We could also search in title, but the API doesn't seem to support it directly
    }

    // Add pagination
    params.append('page[number]', currentPage.toString());
    params.append('page[size]', pageSize.toString());

    return params;
  };

  // Fetch initiatives from API
  useEffect(() => {
    const fetchInitiatives = async () => {
      try {
        setLoading(true);

        const params = buildQueryParams();
        const url = `http://localhost:8000/api/initiatives/?${params.toString()}`;

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const jsonApiResponse: JsonApiResponse = await response.json();

        // Convert JSON:API format to our Initiative format
        const convertedInitiatives = jsonApiResponse.data.map(item => {
          // Find tags for this initiative
          const tagRelationships = item.relationships.tags.data || [];
          const tags = tagRelationships.map(tagRel => {
            const tagData = jsonApiResponse.included?.find(
              included => included.type === 'Tag' && included.id === tagRel.id
            );
            return {
              id: tagRel.id,
              name: tagData?.attributes?.name || 'Unknown'
            };
          });

          return {
            id: item.id,
            title: item.attributes.title,
            summary: item.attributes.description.substring(0, 200) + (item.attributes.description.length > 200 ? '...' : ''),
            category: tags[0]?.name.toLowerCase() || 'other',
            tags: tags,
            author: {
              id: 'author-' + item.id, // No actual author ID in the response
              name: item.attributes['author-name'],
              image: '/avatars/default-user.jpg', // Default image since API doesn't provide one
            },
            createdAt: item.attributes['created-at'],
            votes: item.attributes['votes-count'],
            comments: item.attributes['comments-count'],
            views: 0, // Not provided by API
            supporters: item.attributes['votes-count'] > 0 ? item.attributes['votes-count'] : 0,
          };
        });

        setInitiatives(convertedInitiatives);

        // Update pagination info if available
        if (jsonApiResponse.meta) {
          setTotalPages(jsonApiResponse.meta['page-count'] || 1);
        }

        setError(null);
      } catch (err) {
        console.error('Error fetching initiatives:', err);
        setError('Nie udało się pobrać inicjatyw. Spróbuj ponownie później.');
      } finally {
        setLoading(false);
      }
    };

    fetchInitiatives();
  }, [sortBy, filterCategory, searchQuery, currentPage, pageSize]);

  // Handle page change
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  return (
    <div className="w-full bg-white text-gray-800">
      {/* Main content */}
      <main className="max-w-5xl mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-red-900 mb-2">
              Inicjatywy Obywatelskie
            </h1>
            <p className="text-gray-600">
              Przeglądaj i wspieraj inicjatywy obywatelskie dotyczące ważnych tematów społecznych i politycznych.
            </p>
          </div>
          <Link
            href="/initiatives/new"
            className="bg-red-800 text-white px-4 py-2 rounded-md hover:bg-red-700 flex items-center"
          >
            <PlusCircle size={16} className="mr-2" />
            Nowa Inicjatywa
          </Link>
        </div>

        {/* Quick category/tag filters */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              className={`px-3 py-2 ${filterCategory === 'all' ? 'bg-red-800 text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'} text-sm rounded`}
              onClick={() => setFilterCategory('all')}
            >
              Wszystkie
            </button>
            <button
              className={`px-3 py-2 ${filterCategory === 'social' ? 'bg-red-800 text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'} text-sm rounded`}
              onClick={() => setFilterCategory('social')}
            >
              Polityka Społeczna
            </button>
            <button
              className={`px-3 py-2 ${filterCategory === 'economic' ? 'bg-red-800 text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'} text-sm rounded`}
              onClick={() => setFilterCategory('economic')}
            >
              Gospodarka
            </button>
            <button
              className={`px-3 py-2 ${filterCategory === 'education' ? 'bg-red-800 text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'} text-sm rounded`}
              onClick={() => setFilterCategory('education')}
            >
              Edukacja
            </button>
            <button
              className={`px-3 py-2 ${filterCategory === 'healthcare' ? 'bg-red-800 text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'} text-sm rounded`}
              onClick={() => setFilterCategory('healthcare')}
            >
              Zdrowie
            </button>
            <button
              className={`px-3 py-2 ${filterCategory === 'foreign' ? 'bg-red-800 text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'} text-sm rounded`}
              onClick={() => setFilterCategory('foreign')}
            >
              Obronność
            </button>
          </div>
        </div>

        {/* Filters and search */}
        <div className="mb-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Szukaj inicjatyw po autorze..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="border border-gray-300 rounded px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-red-500 text-sm"
              >
                <option value="newest">Najnowsze</option>
                <option value="oldest">Najstarsze</option>
                <option value="popular">Najpopularniejsze</option>
                <option value="mostCommented">Najczęściej komentowane</option>
                <option value="mostSupported">Najwięcej wsparcia</option>
              </select>

              <select
                value={pageSize.toString()}
                onChange={(e) => setPageSize(parseInt(e.target.value))}
                className="border border-gray-300 rounded px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-red-500 text-sm"
              >
                <option value="10">10 na stronę</option>
                <option value="20">20 na stronę</option>
                <option value="50">50 na stronę</option>
              </select>
            </div>
          </div>
        </div>

        {/* Error message if API fetch fails */}
        {error && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-300 text-yellow-800 rounded-md">
            {error}
          </div>
        )}

        {/* Loading state */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-4 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            ))}
          </div>
        ) : (
          /* Initiative list */
          <div className="space-y-4">
            {initiatives.length > 0 ? (
              initiatives.map((initiative) => (
                <InitiativeCard key={initiative.id} initiative={initiative} />
              ))
            ) : (
              <div className="text-center py-10 bg-gray-50 border border-dashed border-gray-300 rounded-lg">
                <p className="text-gray-500">
                  Nie znaleziono inicjatyw spełniających kryteria wyszukiwania.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Pagination */}
        {!loading && initiatives.length > 0 && (
          <div className="mt-8 flex justify-center">
            <nav className="inline-flex rounded-md shadow">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-4 py-2 text-sm border border-gray-300 rounded-l-md ${
                  currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-500 hover:bg-gray-50'
                }`}
              >
                Poprzednia
              </button>

              {/* Page numbers */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-4 py-2 text-sm border-t border-b border-gray-300 ${
                      currentPage === pageNum ? 'bg-red-800 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 text-sm border border-gray-300 rounded-r-md ${
                  currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-500 hover:bg-gray-50'
                }`}
              >
                Następna
              </button>
            </nav>
          </div>
        )}
      </main>
    </div>
  );
};

export default InitiativeList;