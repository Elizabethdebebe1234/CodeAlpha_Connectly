
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
  const [suggestions, setSuggestions] = useState([]);
  const [profile, setProfile] = useState(null);

  const [activeSection, setActiveSection] = useState("home");
  const [searchTerm, setSearchTerm] = useState("");
  const [peopleList, setPeopleList] = useState([]);
  const [peopleTitle, setPeopleTitle] = useState("");

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

  const loadProfile = async () => {
    try {
      const data = await apiRequest("/users/me");
      setProfile(data);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadPosts();
    loadProfile();

    apiRequest("/users/suggestions")
      .then(setSuggestions)
      .catch((err) => setError(err.message));
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
                  : post.likes.filter(
                      (id) =>
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

  const handleFollow = async (userId) => {
    try {
      const result = await apiRequest(`/users/${userId}/follow`, {
        method: "POST",
      });

      if (result.following) {
        setSuggestions((previous) =>
          previous.filter((person) => person._id !== userId)
        );
      } else {
        const updated = await apiRequest("/users/suggestions");
        setSuggestions(updated);
      }

      const updatedProfile = await apiRequest("/users/me");
      setProfile(updatedProfile);
    } catch (err) {
      setError(err.message);
    }
  };

  const loadPeople = async (type) => {
    try {
      const updatedProfile = await apiRequest("/users/me");
      setProfile(updatedProfile);

      setPeopleList(
        type === "followers"
          ? updatedProfile.followers
          : updatedProfile.following
      );

      setPeopleTitle(
        type === "followers" ? "My Followers" : "People I Follow"
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

  const filteredPosts = posts.filter((post) => {
    const term = searchTerm.toLowerCase();

    return (
      post.content.toLowerCase().includes(term) ||
      (post.author?.name || "").toLowerCase().includes(term)
    );
  });

  const handleLogout = () => {
    localStorage.removeItem("connectly_token");
    localStorage.removeItem("connectly_user");
    navigate("/login");
  };

  const sectionTitles = {
    home: "Home",
    explore: "Explore",
    messages: "Messages",
    notifications: "Notifications",
    profile: "My Profile",
  };

  const visiblePosts =
    activeSection === "profile"
      ? posts.filter((post) => {
          const authorId =
            typeof post.author === "string"
              ? post.author
              : post.author?._id;

          return authorId === user.id;
        })
      : activeSection === "explore"
      ? filteredPosts
      : posts;

  const PostCard = ({ post }) => {
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
  };

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <h2 className="brand">
          connectly<span>.</span>
        </h2>

        <nav className="side-nav">
          {[
            ["home", "⌂", "Home"],
            ["explore", "⌕", "Explore"],
            ["messages", "✉", "Messages"],
            ["notifications", "♡", "Notifications"],
            ["profile", "◉", "My Profile"],
          ].map(([section, icon, label]) => (
            <button
              key={section}
              className={activeSection === section ? "nav-active" : ""}
              onClick={() => {
                setActiveSection(section);
                setPeopleTitle("");
                setError("");
              }}
            >
              {icon} <span>{label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="mini-profile">
            <div className="avatar">
              {(user.name || "U").charAt(0).toUpperCase()}
            </div>

            <div>
              <strong>{user.name || "User"}</strong>
              <small>
                @{(user.name || "user").toLowerCase().replace(/\s+/g, "")}
              </small>
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
            <h1>{sectionTitles[activeSection]}</h1>
            <p>Welcome back, {user.name || "there"} 👋</p>
          </div>

          <div className="header-avatar">
            {(user.name || "U").charAt(0).toUpperCase()}
          </div>
        </header>

        {error && <p className="error-message">{error}</p>}

        {activeSection === "home" && (
          <>
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
          </>
        )}

        {activeSection === "explore" && (
          <>
            <div className="section-heading">
              <h2>Explore Connectly 🌍</h2>
              <span>Discover what people are sharing</span>
            </div>

            <input
              className="explore-search"
              type="search"
              placeholder="Search posts or people..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <h3>Discover posts</h3>
          </>
        )}

        {activeSection === "profile" && profile && (
          <section className="panel-card my-profile">
            <div className="avatar profile-avatar">
              {profile.name.charAt(0).toUpperCase()}
            </div>

            <h2>{profile.name}</h2>
            <p>{profile.bio}</p>

            <div className="profile-stats">
              <button onClick={() => loadPeople("followers")}>
                <strong>{profile.followers.length}</strong>
                <small>Followers</small>
              </button>

              <button onClick={() => loadPeople("following")}>
                <strong>{profile.following.length}</strong>
                <small>Following</small>
              </button>
            </div>

            {peopleTitle && (
              <div className="people-list">
                <h3>{peopleTitle}</h3>

                {peopleList.length === 0 ? (
                  <p>No users to display yet.</p>
                ) : (
                  peopleList.map((person) => (
                    <div className="suggestion" key={person._id}>
                      <div className="avatar">
                        {person.name.charAt(0).toUpperCase()}
                      </div>
                      <strong>{person.name}</strong>
                    </div>
                  ))
                )}
              </div>
            )}

            <h3>My Posts</h3>
          </section>
        )}

        {activeSection === "messages" && (
          <section className="panel-card">
            <h2>Messages ✉</h2>
            <p>Welcome to your conversations.</p>
            <p>
              Your direct messaging feature is not connected yet. Messages
              need a conversation API and database storage.
            </p>
          </section>
        )}

        {activeSection === "notifications" && (
          <section className="panel-card">
            <h2>Notifications ♡</h2>
            <p>Recent community activity</p>

            {posts.some((post) => post.comments.length > 0) ? (
              posts
                .filter((post) => post.comments.length > 0)
                .slice(0, 10)
                .map((post) => (
                  <div className="notification-item" key={post._id}>
                    <strong>{post.comments.length} comment(s)</strong>
                    <p>
                      On {post.author?.name || "a user's"} post: {post.content}
                    </p>
                  </div>
                ))
            ) : (
              <p>No recent comments yet.</p>
            )}
          </section>
        )}

        {activeSection !== "messages" &&
          activeSection !== "notifications" &&
          (loading ? (
            <p>Loading posts...</p>
          ) : visiblePosts.length === 0 ? (
            <p>
              {activeSection === "profile"
                ? "You haven't published any posts yet."
                : activeSection === "explore"
                ? "No matching posts found."
                : "No posts yet. Be the first to share something!"}
            </p>
          ) : (
            visiblePosts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))
          ))}
      </main>

      <aside className="right-panel">
        <div className="search-box">
          <span>⌕</span>
          <input
            type="search"
            placeholder="Search Connectly..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setActiveSection("explore");
            }}
          />
        </div>

        <section className="panel-card">
          <h3>Who to follow</h3>

          {suggestions.length === 0 ? (
            <p>No new people to follow yet.</p>
          ) : (
            suggestions.map((person) => (
              <div className="suggestion" key={person._id}>
                <div className="avatar">
                  {person.name.charAt(0).toUpperCase()}
                </div>

                <div className="suggestion-info">
                  <strong>{person.name}</strong>
                  <small>{person.followers.length} followers</small>
                </div>

                <button onClick={() => handleFollow(person._id)}>
                  Follow
                </button>
              </div>
            ))
          )}
        </section>

        {profile && (
          <section className="panel-card profile-summary">
            <div className="avatar profile-avatar">
              {profile.name.charAt(0).toUpperCase()}
            </div>

            <h3>{profile.name}</h3>
            <p>{profile.bio}</p>

            <div className="profile-stats">
              <button onClick={() => {
                setActiveSection("profile");
                loadPeople("followers");
              }}>
                <strong>{profile.followers.length}</strong>
                <small>Followers</small>
              </button>

              <button onClick={() => {
                setActiveSection("profile");
                loadPeople("following");
              }}>
                <strong>{profile.following.length}</strong>
                <small>Following</small>
              </button>
            </div>
          </section>
        )}

        <section className="panel-card trends">
          <h3>Trending topics</h3>
          <div>
            <small>Technology · Trending</small>
            <strong>#WebDevelopment</strong>
          </div>
          <div>
            <small>Community · Trending</small>
            <strong>#Connectly</strong>
          </div>
          <div>
            <small>Learning · Trending</small>
            <strong>#KeepBuilding</strong>
          </div>
        </section>

        <p className="footer-note">
          About · Privacy · Terms · © 2026 Connectly
        </p>
      </aside>
    </div>
  );
}

export default Home;
