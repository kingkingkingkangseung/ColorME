import { useEffect, useMemo, useState } from "react";
import axios from "axios";

function ImageGrid({ urls, onOpen }) {
  const cleaned =
    urls
      ?.map((url) => (typeof url === "string" ? url.trim() : ""))
      .filter(Boolean) || [];

  if (!cleaned.length) return null;

  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
      {cleaned.map((url) => (
        <img
          key={url}
          src={url}
          alt="post"
          onClick={() => onOpen && onOpen(url)}
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
          style={{
            width: 120,
            height: 120,
            objectFit: "cover",
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.1)",
            cursor: onOpen ? "zoom-in" : "default",
          }}
        />
      ))}
    </div>
  );
}

function ProfileBadge({ author, onOpenProfile }) {
  const name = author?.profile?.displayName || author?.email?.split("@")[0];
  const avatarUrl = author?.profile?.avatarUrl;
  return (
    <button
      onClick={() => onOpenProfile(author)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        border: "none",
        background: "transparent",
        color: "#e5e7eb",
        cursor: "pointer",
      }}
    >
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={name}
          style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover" }}
        />
      ) : (
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: "rgba(59,130,246,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 700,
          }}
        >
          {name?.[0]?.toUpperCase() || "U"}
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
        <span style={{ fontSize: 13, fontWeight: 600 }}>{name}</span>
        <span style={{ fontSize: 11, color: "#94a3b8" }}>{author?.email}</span>
      </div>
    </button>
  );
}

function ProfilePreviewModal({ data, onClose }) {
  if (!data) return null;
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15,23,42,0.75)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 540,
          borderRadius: 24,
          background: "rgba(15,23,42,0.98)",
          border: "1px solid rgba(51,65,85,0.8)",
          padding: 24,
          color: "#e5e7eb",
        }}
      >
        <h3 style={{ marginTop: 0 }}>프로필</h3>
        <div style={{ display: "flex", gap: 16 }}>
          {data.profile.avatarUrl ? (
            <img
              src={data.profile.avatarUrl}
              alt="avatar"
              style={{ width: 90, height: 90, borderRadius: "50%", objectFit: "cover" }}
            />
          ) : (
            <div
              style={{
                width: 90,
                height: 90,
                borderRadius: "50%",
                background: "rgba(59,130,246,0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 32,
              }}
            >
              {data.profile.displayName?.[0]?.toUpperCase() || "U"}
            </div>
          )}
          <div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>{data.profile.displayName}</div>
            <p style={{ fontSize: 13, color: "#94a3b8" }}>{data.profile.bio || "소개가 없습니다."}</p>
          </div>
        </div>
        {data.profile.heroUrl && (
          <img
            src={data.profile.heroUrl}
            alt="hero"
            style={{ width: "100%", borderRadius: 18, margin: "16px 0", maxHeight: 240, objectFit: "cover" }}
          />
        )}
        <h4 style={{ marginBottom: 8 }}>최근 게시글</h4>
        {data.posts.length === 0 ? (
          <p style={{ fontSize: 13, color: "#94a3b8" }}>아직 게시글이 없습니다.</p>
        ) : (
          <ul style={{ fontSize: 13, color: "#e5e7eb", paddingLeft: 16 }}>
            {data.posts.map((post) => (
              <li key={post.id} style={{ marginBottom: 6 }}>
                {post.title}
              </li>
            ))}
          </ul>
        )}
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
          <button
            onClick={onClose}
            style={{
              padding: "8px 16px",
              borderRadius: 999,
              border: "none",
              background: "rgb(59,130,246)",
              color: "#0f172a",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}

function ImagePreviewModal({ src, onClose }) {
  if (!src) return null;
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(2,6,23,0.8)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "relative",
          maxWidth: "90vw",
          maxHeight: "90vh",
        }}
      >
        <img
          src={src}
          alt="preview"
          style={{
            display: "block",
            maxWidth: "90vw",
            maxHeight: "90vh",
            borderRadius: 16,
            border: "1px solid rgba(148,163,184,0.4)",
          }}
        />
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: -10,
            right: -10,
            width: 32,
            height: 32,
            borderRadius: "50%",
            border: "none",
            background: "rgba(59,130,246,0.9)",
            color: "#0f172a",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          ×
        </button>
      </div>
    </div>
  );
}

export default function Community({ apiBase, token }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imagesInput, setImagesInput] = useState("");
  const [uploadedImages, setUploadedImages] = useState([]);
  const [profilePreview, setProfilePreview] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const headers = useMemo(() => {
    if (!token) return {};
    return { Authorization: `Bearer ${token}` };
  }, [token]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${apiBase}/community/posts`, { headers });
      setPosts(res.data || []);
    } catch (err) {
      console.error(err);
      setError('게시글을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleCreatePost = async () => {
    if (!token) return alert('로그인이 필요합니다.');
    if (!title.trim()) return alert('제목을 입력해 주세요.');
    try {
      const urlImages = imagesInput
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean);
      const merged = [...urlImages, ...uploadedImages].slice(0, 4);
      const payload = {
        title: title.trim(),
        content: content.trim(),
        imageUrls: merged,
      };
      const res = await axios.post(`${apiBase}/community/posts`, payload, { headers });
      setPosts((prev) => [res.data, ...prev]);
      setTitle('');
      setContent('');
      setImagesInput('');
      setUploadedImages([]);
    } catch (err) {
      console.error(err);
      alert('게시글 저장 중 오류가 발생했습니다.');
    }
  };

  const fileToDataUrl = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    try {
      const converted = await Promise.all(files.map(fileToDataUrl));
      setUploadedImages((prev) => [...prev, ...converted].slice(0, 4));
    } catch (err) {
      console.error(err);
      alert('이미지 변환 중 오류가 발생했습니다.');
    } finally {
      e.target.value = '';
    }
  };

  const removeUploaded = (index) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleLike = async (postId) => {
    if (!token) return alert('로그인이 필요합니다.');
    try {
      const res = await axios.post(`${apiBase}/community/posts/${postId}/like`, {}, { headers });
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? { ...post, isLiked: res.data.liked, likes: post.likes + (res.data.liked ? 1 : -1) }
            : post
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  const submitComment = async (postId, text, reset) => {
    if (!token) return alert('로그인이 필요합니다.');
    if (!text.trim()) return;
    try {
      const res = await axios.post(
        `${apiBase}/community/posts/${postId}/comments`,
        { content: text.trim() },
        { headers }
      );
      setPosts((prev) =>
        prev.map((post) => (post.id === postId ? { ...post, comments: [...post.comments, res.data] } : post))
      );
      reset();
    } catch (err) {
      console.error(err);
      alert('댓글 저장 중 오류가 발생했습니다.');
    }
  };

  const openProfile = async (author) => {
    const userId = author?.id;
    if (!userId) return;
    try {
      const res = await axios.get(`${apiBase}/community/profile/${userId}`, { headers });
      setProfilePreview(res.data);
    } catch (err) {
      if (err?.response?.status === 403 && author?.profile) {
        setProfilePreview({ profile: author.profile, posts: [] });
        return;
      }
      console.error(err);
      alert('프로필을 확인할 수 없습니다.');
    }
  };

  return (
    <section
      style={{
        borderRadius: 24,
        padding: 24,
        background: "rgba(15,23,42,0.9)",
        border: "1px solid rgba(51,65,85,0.8)",
        maxWidth: 1080,
        margin: "0 auto",
      }}
    >
      <h2 style={{ marginTop: 0 }}>커뮤니티</h2>
      <p style={{ color: "#94a3b8", marginBottom: 16 }}>
        오늘의 착장, 쇼핑 리뷰, 스타일 영감을 공유해 보세요. 이미지 URL을 붙여넣거나 텍스트로 소개해도 좋아요.
      </p>

      {token ? (
        <div
          style={{
            borderRadius: 18,
            padding: 16,
            background: "rgba(2,6,23,0.7)",
            border: "1px solid rgba(51,65,85,0.7)",
            marginBottom: 24,
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <input
            type="text"
            placeholder="제목 (예: 신상 스니커즈 언박싱)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{
              borderRadius: 999,
              border: "1px solid rgba(55,65,81,1)",
              background: "rgba(15,23,42,1)",
              color: "white",
              padding: "8px 14px",
            }}
          />
          <textarea
            placeholder="내용"
            rows={3}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            style={{
              borderRadius: 18,
              border: "1px solid rgba(55,65,81,1)",
              background: "rgba(15,23,42,1)",
              color: "white",
              padding: "10px 14px",
              resize: "vertical",
            }}
          />
          <textarea
            placeholder="이미지 URL 한 줄에 하나씩"
            rows={2}
            value={imagesInput}
            onChange={(e) => setImagesInput(e.target.value)}
            style={{
              borderRadius: 12,
              border: "1px dashed rgba(55,65,81,1)",
              background: "rgba(15,23,42,1)",
              color: "white",
              padding: "8px 12px",
            }}
          />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            <label style={{ fontSize: 13, color: "#cbd5f5" }}>
              또는 파일 첨부 (최대 4개)
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                style={{ display: "block", marginTop: 6 }}
              />
            </label>
            {uploadedImages.length > 0 && (
              <div style={{ display: "flex", gap: 8 }}>
                {uploadedImages.map((img, idx) => (
                  <div key={idx} style={{ position: "relative" }}>
                    <img
                      src={img}
                      alt="preview"
                      style={{ width: 70, height: 70, objectFit: "cover", borderRadius: 12 }}
                    />
                    <button
                      onClick={() => removeUploaded(idx)}
                      style={{
                        position: "absolute",
                        top: -6,
                        right: -6,
                        borderRadius: "50%",
                        border: "none",
                        width: 20,
                        height: 20,
                        background: "rgba(239,68,68,0.8)",
                        color: "white",
                        cursor: "pointer",
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={handleCreatePost}
            style={{
              alignSelf: "flex-end",
              padding: "8px 18px",
              borderRadius: 999,
              border: "none",
              background: "rgb(59,130,246)",
              color: "#0f172a",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            게시글 올리기
          </button>
        </div>
      ) : (
        <p style={{ color: "#94a3b8" }}>로그인하면 게시글을 작성할 수 있습니다.</p>
      )}

      {loading ? (
        <p style={{ color: "#94a3b8" }}>불러오는 중...</p>
      ) : error ? (
        <p style={{ color: "#f87171" }}>{error}</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {posts.map((post) => (
            <div
              key={post.id}
              style={{
                borderRadius: 18,
                padding: 18,
                background: "rgba(2,6,23,0.7)",
                border: "1px solid rgba(51,65,85,0.7)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <ProfileBadge author={post.author} onOpenProfile={openProfile} />
                <small style={{ color: "#64748b" }}>
                  {new Date(post.createdAt).toLocaleString()}
                </small>
              </div>
              <h3 style={{ marginBottom: 8 }}>{post.title}</h3>
              {post.content && <p style={{ color: "#cbd5f5" }}>{post.content}</p>}
              <ImageGrid urls={post.imageUrls} onOpen={setImagePreview} />
              <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
                <button
                  onClick={() => toggleLike(post.id)}
                  style={{
                    borderRadius: 999,
                    border: "1px solid rgba(59,130,246,0.4)",
                    background: post.isLiked ? "rgba(59,130,246,0.2)" : "transparent",
                    color: "#bfdbfe",
                    padding: "6px 14px",
                    cursor: "pointer",
                  }}
                >
                  ♥ {post.likes}
                </button>
              </div>
              <div style={{ marginTop: 16 }}>
                {post.comments.map((comment) => (
                  <div key={comment.id} style={{ marginBottom: 8 }}>
                    <button
                      onClick={() => openProfile(comment.author)}
                      style={{
                        border: "none",
                        background: "transparent",
                        color: "#e2e8f0",
                        fontWeight: 700,
                        cursor: "pointer",
                        padding: 0,
                        marginRight: 6,
                      }}
                    >
                      {comment.author.profile.displayName}
                    </button>
                    <span style={{ color: "#cbd5f5" }}>{comment.content}</span>
                  </div>
                ))}
                {token && (
                  <CommentInput postId={post.id} onSubmit={submitComment} />
                )}
              </div>
            </div>
          ))}
          {posts.length === 0 && <p style={{ color: "#94a3b8" }}>아직 게시글이 없습니다.</p>}
        </div>
      )}

      <ProfilePreviewModal data={profilePreview} onClose={() => setProfilePreview(null)} />
      <ImagePreviewModal src={imagePreview} onClose={() => setImagePreview("")} />
    </section>
  );
}

function CommentInput({ postId, onSubmit }) {
  const [text, setText] = useState("");
  return (
    <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="댓글을 입력하세요"
        style={{
          flex: 1,
          borderRadius: 999,
          border: "1px solid rgba(55,65,81,1)",
          background: "rgba(15,23,42,1)",
          color: "white",
          padding: "6px 12px",
        }}
      />
      <button
        onClick={() => onSubmit(postId, text, () => setText(""))}
        style={{
          borderRadius: 999,
          border: "none",
          padding: "6px 12px",
          background: "rgba(34,197,94,0.2)",
          color: "#bbf7d0",
          cursor: "pointer",
        }}
      >
        등록
      </button>
    </div>
  );
}
