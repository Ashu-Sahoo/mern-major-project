import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BookOpen, Plus, Trash2, PenLine, Sparkles, RefreshCw, FileText } from "lucide-react";
import { createPost, deletePost, getPosts } from "./services/api";

const initialForm = {
  title: "",
  content: "",
  author: "",
  category: "Technology"
};

function formatDate(date) {
  if (!date) return "";
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium"
  }).format(new Date(date));
}

export default function App() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(initialForm);
  const [selectedPost, setSelectedPost] = useState(null);

  const postsQuery = useQuery({
    queryKey: ["posts"],
    queryFn: getPosts
  });

  const createMutation = useMutation({
    mutationFn: createPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      setForm(initialForm);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deletePost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      if (selectedPost) setSelectedPost(null);
    }
  });

  const posts = postsQuery.data || [];

  function updateField(event) {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value
    }));
  }

  function submitPost(event) {
    event.preventDefault();
    createMutation.mutate({
      ...form,
      author: form.author.trim() || "Anonymous"
    });
  }

  function removePost(id) {
    if (window.confirm("Delete this blog post? This cannot be undone.")) {
      deleteMutation.mutate(id);
    }
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="BlogSpace home">
          <span className="brand-icon"><BookOpen size={22} /></span>
          <span>Blog<span className="brand-accent">Space</span></span>
        </a>
        <div className="topbar-note"><span className="live-dot" /> YOUR PERSONAL PUBLISHING SPACE</div>
      </header>

      <main className="page">
        <section className="hero">
          <div className="eyebrow"><Sparkles size={14} /> IDEAS DESERVE TO BE SHARED</div>
          <h1>Write what matters.<br /><span>Share what inspires.</span></h1>
          <p>A simple space for your stories, discoveries and ideas. Create a post and let your words travel.</p>
          <div className="hero-stats">
            <div><strong>{posts.length}</strong><span>Published stories</span></div>
            <div className="stat-divider" />
            <div><strong>∞</strong><span>Ideas to explore</span></div>
          </div>
        </section>

        <section className="workspace">
          <aside className="composer panel">
            <div className="panel-heading">
              <div className="heading-icon"><PenLine size={19} /></div>
              <div><h2>Create a story</h2><p>Put your thoughts into words.</p></div>
            </div>

            <form onSubmit={submitPost} className="post-form">
              <label htmlFor="title">Title</label>
              <input id="title" name="title" value={form.title} onChange={updateField} maxLength={160} placeholder="Give your story a title" required />

              <div className="form-row">
                <div>
                  <label htmlFor="author">Author</label>
                  <input id="author" name="author" value={form.author} onChange={updateField} maxLength={80} placeholder="Your name" />
                </div>
                <div>
                  <label htmlFor="category">Category</label>
                  <select id="category" name="category" value={form.category} onChange={updateField}>
                    <option>Technology</option>
                    <option>Education</option>
                    <option>Lifestyle</option>
                    <option>Travel</option>
                    <option>General</option>
                  </select>
                </div>
              </div>

              <label htmlFor="content">Your story</label>
              <textarea id="content" name="content" value={form.content} onChange={updateField} maxLength={20000} rows={8} placeholder="Start writing here..." required />
              <div className="character-count">{form.content.length.toLocaleString()} / 20,000 characters</div>

              <button className="primary-button" type="submit" disabled={createMutation.isPending}>
                <Plus size={18} /> {createMutation.isPending ? "Publishing..." : "Publish story"}
              </button>
              {createMutation.isError && <p className="inline-error" role="alert">{createMutation.error.message}</p>}
              {createMutation.isSuccess && <p className="inline-success">Your story has been published.</p>}
            </form>
            <div className="composer-tip"><Sparkles size={15} /><span>Good stories start with a simple idea.</span></div>
          </aside>

          <section className="feed">
            <div className="feed-heading">
              <div><span className="section-kicker">THE COMMUNITY JOURNAL</span><h2>Latest stories</h2></div>
              <button className="icon-button" onClick={() => postsQuery.refetch()} aria-label="Refresh stories" title="Refresh">
                <RefreshCw size={17} />
              </button>
            </div>

            {postsQuery.isLoading && <div className="state-card"><span className="loader" /> Loading stories...</div>}
            {postsQuery.isError && (
              <div className="state-card error-card">
                <h3>We could not load the stories.</h3>
                <p>{postsQuery.error.message}</p>
                <button className="secondary-button" onClick={() => postsQuery.refetch()}>Try again</button>
              </div>
            )}
            {!postsQuery.isLoading && !postsQuery.isError && posts.length === 0 && (
              <div className="empty-card">
                <div className="empty-icon"><FileText size={27} /></div>
                <h3>The first page is yours.</h3>
                <p>No stories have been published yet. Create the first one using the form.</p>
              </div>
            )}

            <div className="story-list">
              {posts.map((post) => (
                <article className="story-card" key={post._id}>
                  <div className="story-meta">
                    <span className="category-pill">{post.category || "General"}</span>
                    <span>{formatDate(post.createdAt)}</span>
                  </div>
                  <button className="story-title-button" onClick={() => setSelectedPost(post)}>
                    <h3>{post.title}</h3>
                  </button>
                  <p className="story-excerpt">{post.content}</p>
                  <div className="story-footer">
                    <span className="author-avatar">{(post.author || "A").charAt(0).toUpperCase()}</span>
                    <span className="author-name">{post.author || "Anonymous"}</span>
                    <button className="delete-button" onClick={() => removePost(post._id)} disabled={deleteMutation.isPending} aria-label={`Delete ${post.title}`}>
                      <Trash2 size={16} /> Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </section>
      </main>

      <footer className="footer">
        <a className="footer-brand" href="/">BlogSpace</a>
        <span>Built with React, Express & MongoDB</span>
        <span>Write. Share. Inspire.</span>
      </footer>

      {selectedPost && (
        <div className="modal-backdrop" role="presentation" onClick={() => setSelectedPost(null)}>
          <section className="post-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" onClick={(event) => event.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedPost(null)} aria-label="Close article">×</button>
            <span className="category-pill">{selectedPost.category || "General"}</span>
            <h2 id="modal-title">{selectedPost.title}</h2>
            <p className="modal-meta">By {selectedPost.author || "Anonymous"} · {formatDate(selectedPost.createdAt)}</p>
            <p className="modal-content">{selectedPost.content}</p>
          </section>
        </div>
      )}
    </div>
  );
}
