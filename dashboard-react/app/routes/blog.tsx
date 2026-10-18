import { useEffect, useState } from "react";
import { toast } from "~/lib/stores/toast";
import {
  Search,
  X,
  Eye,
  Calendar,
  RefreshCw,
  ExternalLink,
  ToggleLeft,
  ToggleRight,
  Image as ImageIcon,
  User,
  Tag,
} from "lucide-react";

import { API_BASE } from "~/lib/api/base";

interface BlogPost {
  id: string;
  wpId: number;
  title: string;
  excerpt: string;
  content: string;
  link: string;
  slug: string;
  featuredImage: string | null;
  authorName: string | null;
  authorAvatar: string | null;
  categories: string | null;
  tags: string | null;
  wpDate: string;
  wpModified: string | null;
  approved: boolean;
  syncedAt: string;
}

export function meta() {
  return [{ title: "Blog Posts" }];
}

export default function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "approved" | "pending">("all");
  const filterStatuses = ["all", "pending", "approved"] as const;

  // Detail modal
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [activePost, setActivePost] = useState<BlogPost | null>(null);

  async function fetchPosts() {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/public/blog-posts`);
      const json = await res.json();
      if (json?.success && json?.data?.posts) {
        setPosts(json.data.posts);
      }
    } catch (err) {
      console.error("Failed to fetch blog posts:", err);
      toast("error", "Failed to load blog posts");
    } finally {
      setIsLoading(false);
    }
  }

  async function syncFromWordPress() {
    setIsSyncing(true);
    try {
      const res = await fetch(`${API_BASE}/public/blog-posts/sync`, { method: "POST" });
      const json = await res.json();
      if (json?.success) {
        toast("success", json.data?.message || "Synced successfully");
        await fetchPosts();
      } else {
        toast("error", json?.message || "Sync failed");
      }
    } catch (err) {
      console.error("Sync failed:", err);
      toast("error", "Failed to sync from WordPress");
    } finally {
      setIsSyncing(false);
    }
  }

  async function toggleApproval(id: string) {
    try {
      const res = await fetch(`${API_BASE}/public/blog-posts/${id}/approve`, { method: "PATCH" });
      const json = await res.json();
      if (json?.success) {
        setPosts(posts.map((p) => (p.id === id ? { ...p, approved: json.data.approved } : p)));
        toast("success", json.data?.message || "Updated");
      } else {
        toast("error", json?.message || "Failed to update");
      }
    } catch (err) {
      console.error("Toggle approval failed:", err);
      toast("error", "Failed to update approval");
    }
  }

  useEffect(() => {
    fetchPosts();
  }, []);

  const displayedPosts = (() => {
    let list = posts;
    if (filterStatus !== "all") {
      list = list.filter((p) => (filterStatus === "approved" ? p.approved : !p.approved));
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          (p.authorName && p.authorName.toLowerCase().includes(q)) ||
          (p.excerpt && p.excerpt.toLowerCase().includes(q))
      );
    }
    return [...list].sort((a, b) => new Date(b.wpDate).getTime() - new Date(a.wpDate).getTime());
  })();

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
  }

  function stripHtml(html: string) {
    return html?.replace(/<[^>]*>/g, "") || "";
  }

  function parseCategories(json: string | null): string[] {
    try {
      return json ? JSON.parse(json) : [];
    } catch {
      return [];
    }
  }

  function openDetail(post: BlogPost) {
    setActivePost(post);
    setIsDetailModalOpen(true);
  }

  function closeDetailModal() {
    setIsDetailModalOpen(false);
    setActivePost(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-green-950 tracking-tight flex items-center gap-2">
            <ToggleLeft className="w-7 h-7 text-green-700" />
            Blog Posts
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">Sync from An-Nuur Press and approve posts for the website.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={syncFromWordPress}
            disabled={isSyncing}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-full text-xs font-semibold bg-green-100 text-green-800 hover:bg-green-200 transition-all shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? "animate-spin" : ""}`} />
            <span>{isSyncing ? "Syncing..." : "Sync from WordPress"}</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white p-4 rounded-2xl border border-green-100 shadow-sm">
        <div className="flex items-center gap-2">
          {filterStatuses.map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                filterStatus === status ? "bg-green-700 text-white shadow-sm" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {status === "all" ? "All" : status === "pending" ? "Pending" : "Approved"}
            </button>
          ))}
        </div>
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-green-700 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search title, author, excerpt..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-green-50/50 border border-green-200 rounded-xl pl-9 pr-3 py-2 text-xs text-green-950 focus:outline-none focus:ring-2 focus:ring-green-600"
          />
        </div>
      </div>

      {/* Posts */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-4 border-green-200 border-t-green-700 rounded-full animate-spin"></div>
        </div>
      ) : displayedPosts.length === 0 ? (
        <div className="bg-white border border-green-100 rounded-2xl p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-green-50 text-green-700 flex items-center justify-center mx-auto">
            <ToggleLeft className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-green-950">No Posts Found</h3>
          <p className="text-xs text-gray-500">Click "Sync from WordPress" to fetch the latest posts from An-Nuur Press.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayedPosts.map((post) => (
            <div
              key={post.id}
              className="w-full bg-white rounded-xl border border-gray-100 hover:border-green-200 p-4 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex items-start gap-3">
                {post.featuredImage ? (
                  <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                    <img src={post.featuredImage} alt={post.title} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-gray-100 flex items-center justify-center">
                    <ImageIcon className="w-6 h-6 text-gray-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-bold text-green-950 line-clamp-1">{post.title}</h4>
                    {post.approved ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-100 text-green-800 shrink-0">Approved</span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800 shrink-0">Pending</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 line-clamp-2">{stripHtml(post.excerpt)}</p>
                  <div className="flex items-center gap-3 mt-2 text-[11px] text-gray-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(post.wpDate)}
                    </span>
                    {post.authorName && (
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {post.authorName}
                      </span>
                    )}
                    {parseCategories(post.categories)
                      .slice(0, 2)
                      .map((cat, idx) => (
                        <span key={idx} className="flex items-center gap-1">
                          <Tag className="w-3 h-3" />
                          {cat}
                        </span>
                      ))}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => openDetail(post)}
                    className="p-2 text-gray-400 hover:text-blue-700 hover:bg-blue-100 rounded-lg transition-colors"
                    title="View details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => toggleApproval(post.id)}
                    className={`p-2 rounded-lg transition-colors ${
                      post.approved ? "text-green-600 hover:bg-green-100" : "text-gray-400 hover:bg-amber-100 hover:text-amber-600"
                    }`}
                    title={post.approved ? "Unapprove" : "Approve"}
                  >
                    {post.approved ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {isDetailModalOpen && activePost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto border border-gray-100">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-bold text-green-950 line-clamp-2">{activePost.title}</h3>
                <p className="text-[11px] text-gray-500 flex items-center gap-1 mt-1">
                  <Calendar className="w-3 h-3" /> {formatDate(activePost.wpDate)}
                  {activePost.authorName && (
                    <>
                      <span className="mx-1">•</span>
                      {activePost.authorName}
                    </>
                  )}
                </p>
              </div>
              <button onClick={closeDetailModal} className="text-gray-400 hover:text-gray-700 shrink-0 ml-3">
                <X className="w-5 h-5" />
              </button>
            </div>

            {activePost.featuredImage && (
              <img src={activePost.featuredImage} alt={activePost.title} className="w-full h-40 object-cover rounded-xl border border-gray-100" />
            )}

            <div className="space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                {activePost.approved ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-100 text-green-800">Approved</span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800">Pending Review</span>
                )}
                {parseCategories(activePost.categories).map((cat, idx) => (
                  <span key={idx} className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-700">
                    {cat}
                  </span>
                ))}
              </div>

              <div className="bg-green-50/50 p-4 rounded-xl border border-green-100">
                <p className="text-xs text-gray-600 font-semibold mb-1">Excerpt</p>
                <p className="text-xs text-gray-700">{stripHtml(activePost.excerpt)}</p>
              </div>

              {activePost.content && (
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 max-h-48 overflow-y-auto">
                  <p className="text-xs text-gray-600 font-semibold mb-1">Full Content</p>
                  <div className="text-xs text-gray-700 prose prose-xs max-w-none" dangerouslySetInnerHTML={{ __html: activePost.content }} />
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
              <button
                onClick={() => toggleApproval(activePost!.id)}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all ${
                  activePost!.approved ? "bg-amber-100 text-amber-800 hover:bg-amber-200" : "bg-green-700 text-white hover:bg-green-800"
                }`}
              >
                {activePost!.approved ? (
                  <>
                    <ToggleRight className="w-4 h-4" /> Unapprove
                  </>
                ) : (
                  <>
                    <ToggleLeft className="w-4 h-4" /> Approve
                  </>
                )}
              </button>
              <a
                href={activePost!.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50"
              >
                <ExternalLink className="w-3.5 h-3.5" /> View on WordPress
              </a>
              <div className="flex-1"></div>
              <button onClick={closeDetailModal} className="px-4 py-2 rounded-full border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
