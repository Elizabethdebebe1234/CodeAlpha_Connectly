
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../services/api";

function Home() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("connectly_user") || "{}");

  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [commentDrafts, setCommentDrafts] = useState({});

  const loadPosts = async () => {
    try {
      const data = await apiRequest("/posts");
      setPosts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const handlePost = async (e) => {
    e.preventDefault();
    if (!newPost.trim()) return;

    try {
      const post = await apiRequest("/posts", {
        method: "POST",
        body: JSON.stringify({ content: newPost }),
      });

      setPosts((previous) => [post, ...previous]);
      setNewPost("");
      setError("");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLike = async (postId) => {
    try {
      const result = await apiRequest(`/posts/${postId}/like`, {
        method: "POST",
      });

      setPosts((previous) =>
        previous.map((post) =>
          post._id === postId
            ? {
                ...post,
                likes: result.liked
                  ? [...post.likes, user.id]
                  : post.likes.filter((id) =>
                      (typeof id === "string" ? id : id._id) !== user.id
                    ),
              }
            : post
        )
      );
    } catch (err) {
      setError(err.message);
    }
  };

  const handleComment = async (e, postId) => {
  e.preventDefault();

  const text = commentDrafts[postId]?.trim();
  if (!text) return;

  try {
    const comment = await apiRequest(`/posts/${postId}/comments`, {
      method: "POST",
      body: JSON.stringify({ text }),
    });

    setPosts((previous) =>
      previous.map((post) =>
        post._id === postId
          ? { ...post, comments: [...post.comments, comment] }
          : post
      )
    );

    setCommentDrafts((previous) => ({
      ...previous,
      [postId]: "",
    }));

    setError("");
  } catch (err) {
    setError(err.message);
  }
};
        

  const handleLogout = () => {
    localStorage.removeItem("connectly_token");
    localStorage.removeItem("connectly_user");
    navigate("/login");
  };

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <h2 className="brand">connectly<span>.</span></h2>

        <nav className="side-nav">
          <a className="nav-active" href="/">⌂ <span>Home</span></a>
          <a href="#explore">⌕ <span>Explore</span></a>
          <a href="#messages">✉ <span>Messages</span></a>
          <a href="#notifications">♡ <span>Notifications</span></a>
          <a href="#profile">◉ <span>My Profile</span></a>
        </nav>

        <div className="sidebar-bottom">
          <div className="mini-profile">
            <div className="avatar">
              {(user.name || "U").charAt(0).toUpperCase()}
            </div>
            <div>
              <strong>{user.name || "User"}</strong>
              <small>@{(user.name || "user").toLowerCase().replace(/\s+/g, "")}</small>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>Log out</button>
        </div>
      </aside>

      <main className="feed">
        <header className="feed-header">
          <div>
            <h1>Home</h1>
            <p>Welcome back, {user.name || "there"} 👋</p>
          </div>
          <div className="header-avatar">
            {(user.name || "U").charAt(0).toUpperCase()}
          </div>
        </header>

        <form className="create-post" onSubmit={handlePost}>
          <div className="composer-top">
            <div className="avatar">
              {(user.name || "U").charAt(0).toUpperCase()}
            </div>
            <textarea
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder="What's happening in your world?"
              rows="3"
            />
          </div>
          <div className="composer-bottom">
            <span>Share your thoughts with the community</span>
            <button type="submit" disabled={!newPost.trim()}>
              + Publish post
            </button>
          </div>
        </form>

        {error && <p className="error-message">{error}</p>}

        <div className="section-heading">
          <h2>Your Feed</h2>
          <span>Latest posts</span>
        </div>

        {loading ? (
          <p>Loading posts...</p>
        ) : posts.length === 0 ? (
          <p>No posts yet. Be the first to share something!</p>
        ) : (
          posts.map((post) => {
            const liked = post.likes.some(
              (id) => (typeof id === "string" ? id : id._id) === user.id
            );

            return (
              <article className="post-card" key={post._id}>
                <div className="post-top">
                  <div className="avatar">
                    {(post.author?.name || "U").charAt(0).toUpperCase()}
                  </div>
                  <div className="post-author">
                    <strong>{post.author?.name || "Unknown user"}</strong>
                    <small>{new Date(post.createdAt).toLocaleString()}</small>
                  </div>
                </div>

                <p className="post-content">{post.content}</p>

                <div className="post-stats">
                  <span>{post.likes.length} likes</span>
                  <span>{post.comments.length} comments</span>
                </div>

                <div className="post-actions">
                  <button
                    className={liked ? "liked" : ""}
                    onClick={() => handleLike(post._id)}
                  >
                    {liked ? "♥ Liked" : "♡ Like"}
                  </button>
                 <button
  onClick={() =>
    document.getElementById(`comment-${post._id}`)?.focus()
  }
>
  ◯ Comment
</button>
                  <button onClick={() => alert("Sharing coming soon!")}>
                    ↗ Share
                  </button>
                </div>

                <div className="comments-section">
  {post.comments.map((comment) => (
    <div className="comment-item" key={comment._id}>
      <strong>{comment.user?.name || "User"}</strong>
      <p>{comment.text}</p>
    </div>
  ))}

  <form
    className="comment-form"
    onSubmit={(e) => handleComment(e, post._id)}
  >
    <input
      id={`comment-${post._id}`}
      value={commentDrafts[post._id] || ""}
      onChange={(e) =>
        setCommentDrafts((previous) => ({
          ...previous,
          [post._id]: e.target.value,
        }))
      }
      placeholder="Write a comment..."
    />
    <button type="submit">Send</button>
  </form>
</div>
              </article>
            );
          })
        )}
      </main>

      <aside className="right-panel">
        <div className="search-box">
          <span>⌕</span>
          <input type="search" placeholder="Search Connectly..." />
        </div>

        <section className="panel-card">
          <h3>Who to follow</h3>
          {[
            ["JD", "James Davis", "@jamesd"],
            ["AM", "Anna Miller", "@annam"],
            ["DK", "David Kim", "@davidk"],
          ].map((person) => (
            <div className="suggestion" key={person[2]}>
              <div className="avatar">{person[0]}</div>
              <div className="suggestion-info">
                <strong>{person[1]}</strong>
                <small>{person[2]}</small>
              </div>
              <button onClick={() => alert("Following coming soon!")}>
                Follow
              </button>
            </div>
          ))}
        </section>

        <section className="panel-card trends">
          <h3>Trending topics</h3>
          <div><small>Technology · Trending</small><strong>#WebDevelopment</strong></div>
          <div><small>Community · Trending</small><strong>#Connectly</strong></div>
          <div><small>Learning · Trending</small><strong>#KeepBuilding</strong></div>
        </section>

        <p className="footer-note">About · Privacy · Terms · © 2026 Connectly</p>
      </aside>
    </div>
  );
}

export default Home;
