"use client";
import { useEffect, useMemo, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import LoadingSpinner from "@/components/LoadingSpinner";

type Post = { 
  id: string; 
  title: string; 
  tags: string[]; 
  postedAt: string; 
  postedBy: string; 
  content: string; 
};

type ListRes = { 
  items: Post[]; 
  total: number; 
  page: number; 
  pageSize: number; 
};

const PAGE_SIZE = 12;

export default function PostsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  // Filters / state
  const [q, setQ] = useState("");
  const [tag, setTag] = useState("");
  const [page, setPage] = useState(1);

  // Data
  const [posts, setPosts] = useState<Post[]>([]);
  const [total, setTotal] = useState(0);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [popularTags, setPopularTags] = useState<Array<{tag: string; count: number}>>([]);

  // UX
  const [loading, setLoading] = useState(true);
  const [tagsLoading, setTagsLoading] = useState(false);
  const [error, setError] = useState<string>("");

  // Initialize from URL
  useEffect(() => {
    const urlQ = searchParams.get("q") || "";
    const urlTag = searchParams.get("tag") || "";
    const urlPage = parseInt(searchParams.get("page") || "1", 10);

    setQ(urlQ);
    setTag(urlTag);
    setPage(Number.isNaN(urlPage) ? 1 : urlPage);
  }, [searchParams]);

  // Keep URL in sync
  const updateURL = useCallback((newQ: string, newTag: string, newPage: number) => {
    const params = new URLSearchParams();
    if (newQ) params.set("q", newQ);
    if (newTag) params.set("tag", newTag);
    if (newPage > 1) params.set("page", String(newPage));
    const url = params.toString() ? `/posts?${params.toString()}` : "/posts";
    router.replace(url, { scroll: false });
  }, [router]);

  // Load posts
  const loadPosts = useCallback(async () => {
    if (!isAuthenticated) return;

    setLoading(true);
    setError("");
    try {
      const qs = new URLSearchParams({
        q,
        tag,
        page: String(page),
        pageSize: String(PAGE_SIZE),
      }).toString();
      const res = await api<ListRes>(`/posts?${qs}`);
      setPosts(res.items);
      setTotal(res.total);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load posts";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [q, tag, page, isAuthenticated]);

  // Load tags and calculate popular ones
  const loadTags = useCallback(async () => {
    if (!isAuthenticated) return;

    setTagsLoading(true);
    try {
      const res = await api<ListRes>(`/posts?pageSize=100`);
      
      // Get all unique tags
      const unique = Array.from(new Set(res.items.flatMap(p => p.tags))).sort();
      setAvailableTags(unique);

      // Calculate tag frequency
      const tagCounts = res.items.flatMap(p => p.tags).reduce((acc, tag) => {
        acc[tag] = (acc[tag] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Sort by frequency and get top 10
      const popular = Object.entries(tagCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([tag, count]) => ({ tag, count }));

      setPopularTags(popular);
    } catch {
      // silent fail for tags
    } finally {
      setTagsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => { loadPosts(); }, [loadPosts]);
  useEffect(() => { loadTags(); }, [loadTags]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(total / PAGE_SIZE)),
    [total]
  );

  const onSearch = () => {
    setPage(1);
    updateURL(q, tag, 1);
  };

  const onClearFilters = () => {
    setQ("");
    setTag("");
    setPage(1);
    updateURL("", "", 1);
  };

  const createExcerpt = (html: string, maxLen = 150) => {
    const text = html.replace(/<[^>]*>/g, "");
    return text.length > maxLen ? `${text.slice(0, maxLen)}...` : text;
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Please Sign In</h1>
            <p className="text-gray-600 mb-6">You need to be logged in to view posts.</p>
            <Link href="/login" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Blog Posts</h1>
        </div>

        {/* Filters */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-6 mb-6">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <input
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Search posts..."
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && onSearch()}
                />
                <svg className="w-5 h-5 text-gray-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
              </div>
            </div>

            {/* Tag */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by tag</label>
              <select
                value={tag}
                onChange={(e) => {
                  setTag(e.target.value);
                  setPage(1);
                  updateURL(q, e.target.value, 1);
                }}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                disabled={tagsLoading}
              >
                <option value="">All tags</option>
                {availableTags.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Actions / Active filters */}
          <div className="mt-4 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <div className="flex gap-2">
              <button
                onClick={onSearch}
                className="inline-flex items-center px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                disabled={loading}
              >
                Search
              </button>
              {(q || tag) && (
                <button
                  onClick={onClearFilters}
                  className="inline-flex items-center px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Clear
                </button>
              )}
            </div>

            {(q || tag) && (
              <div className="flex flex-wrap gap-2">
                {q && (
                  <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm bg-blue-100 text-blue-800">
                    “{q}”
                    <button
                      onClick={() => {
                        setQ("");
                        setPage(1);
                        updateURL("", tag, 1);
                      }}
                      className="ml-2"
                      title="Remove search"
                    >
                      ✕
                    </button>
                  </span>
                )}
                {tag && (
                  <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm bg-green-100 text-green-800">
                    {tag}
                    <button
                      onClick={() => {
                        setTag("");
                        setPage(1);
                        updateURL(q, "", 1);
                      }}
                      className="ml-2"
                      title="Remove tag"
                    >
                      ✕
                    </button>
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Popular Tags */}
        {!loading && !error && popularTags.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Popular Tags</h2>
            <div className="flex flex-wrap gap-2">
              {popularTags.map(({ tag: t, count }) => (
                <button
                  key={t}
                  onClick={() => {
                    setTag(t);
                    setPage(1);
                    updateURL(q, t, 1);
                  }}
                  className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                    tag === t
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-blue-100 hover:text-blue-800'
                  }`}
                >
                  {t}
                  <span className="ml-1 text-xs opacity-70">({count})</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-12">
            <LoadingSpinner />
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="text-red-700">{error}</div>
          </div>
        )}

        {/* Results summary */}
        {!loading && !error && (
          <p className="text-sm text-gray-600 mb-4">
            Showing {posts.length} {posts.length === 1 ? "post" : "posts"}
            {q && <> matching “{q}”</>}
            {tag && <> tagged “{tag}”</>}
          </p>
        )}

        {/* List */}
        {!loading && !error && (
          <>
            {posts.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900 mb-2">No posts found</h3>
                <p className="text-gray-600">Try different keywords or tags.</p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {posts.map((post) => (
                  <article
                    key={post.id}
                    className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                  >
                    <h2 className="text-xl font-semibold text-gray-900 mb-3">
                      <Link href={`/posts/${post.id}`} className="hover:text-blue-600">
                        {post.title}
                      </Link>
                    </h2>

                    <div className="text-sm text-gray-600 mb-3">
                      By {post.postedBy} • {new Date(post.postedAt).toLocaleDateString()}
                    </div>

                    <div className="text-gray-700 mb-4 line-clamp-3">
                      {createExcerpt(post.content)}
                    </div>

                    {post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {post.tags.slice(0, 3).map((t, i) => (
                          <button
                            key={`${post.id}-tag-${i}`}
                            onClick={() => {
                              setTag(t);
                              setPage(1);
                              updateURL(q, t, 1);
                            }}
                            className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded hover:bg-blue-100 hover:text-blue-800"
                          >
                            {t}
                          </button>
                        ))}
                        {post.tags.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-sm rounded">
                            +{post.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    <Link
                      href={`/posts/${post.id}`}
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Read more →
                    </Link>
                  </article>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-8 bg-white rounded-lg border border-gray-200 p-4">
                <div className="text-sm text-gray-600 order-2 sm:order-1">
                  Page {page} of {totalPages}
                </div>
                <div className="flex gap-2 order-1 sm:order-2">
                  <button
                    disabled={page <= 1}
                    onClick={() => {
                      const newPage = page - 1;
                      setPage(newPage);
                      updateURL(q, tag, newPage);
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50"
                  >
                    ← Previous
                  </button>
                  <button
                    disabled={page >= totalPages}
                    onClick={() => {
                      const newPage = page + 1;
                      setPage(newPage);
                      updateURL(q, tag, newPage);
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
