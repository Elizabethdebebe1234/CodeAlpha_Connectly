
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("connectly_user") || "{}");

  const [posts, setPosts] = useState([
    {
      id: 1,
      name: "Sarah Johnson",
      username: "@sarahj",
      time: "2 hours ago",
      content: "Just started my new journey in web development! Excited to learn and build amazing things. 🚀",
      likes: 24,
      comments: 8,
    },
    {
      id: 2,
      name: "Michael Brown",
      username: "@michaelb",
      time: "4 hours ago",
      content: "Great things happen when creativity meets technology. Keep building, keep growing! 💻",
      likes: 16,
      comments: 3,
    },
  ]);

  const [newPost, setNewPost] = useState("");
  const [likedPosts, setLikedPosts] = useState([]);

  const handlePost = (e) => {
    e.preventDefault();

    if (!newPost.trim()) return;

    const post = {
      id: Date.now(),
      name: user.name || "You",
      username: "@you",
      time: "Just now",
      content: newPost,
      likes: 0,
      comments: 0,
    };

    setPosts([post, ...posts]);
    setNewPost("");
  };

  const handleLike = (id) => {
    const alreadyLiked = likedPosts.includes(id);

    setLikedPosts((previous) =>
      alreadyLiked
        ? previous.filter((postId) => postId !== id)
        : [...previous, id]
    );

    setPosts((previous) =>
      previous.map((post) =>
        post.id === id
          ? { ...post, likes: post.likes + (alreadyLiked ? -1 : 1) }
          : post
      )
    );
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
            <div className="avatar">{(user.name || "U").charAt(0).toUpperCase()}</div>
            <div>
              <strong>{user.name || "User"}</strong>
              <small>@{(user.name || "user").toLowerCase().replace(/\s+/g, "")}</small>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            Log out
          </button>
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

        <div className="section-heading">
          <h2>Your Feed</h2>
          <span>Latest posts</span>
        </div>

        {posts.map((post) => (
          <article className="post-card" key={post.id}>
            <div className="post-top">
              <div className="avatar">{post.name.charAt(0).toUpperCase()}</div>
              <div className="post-author">
                <strong>{post.name}</strong>
                <small>{post.username} · {post.time}</small>
              </div>
              <button className="more-btn" aria-label="More options">•••</button>
            </div>

            <p className="post-content">{post.content}</p>

            <div className="post-stats">
              <span>{post.likes} likes</span>
              <span>{post.comments} comments</span>
            </div>

            <div className="post-actions">
              <button
                className={likedPosts.includes(post.id) ? "liked" : ""}
                onClick={() => handleLike(post.id)}
              >
                {likedPosts.includes(post.id) ? "♥ Liked" : "♡ Like"}
              </button>
              <button onClick={() => alert("Comments are coming soon!")}>
                ◯ Comment
              </button>
              <button onClick={() => alert("Sharing is coming soon!")}>
                ↗ Share
              </button>
            </div>
          </article>
        ))}
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
              <button onClick={() => alert("Following feature is coming soon!")}>
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
