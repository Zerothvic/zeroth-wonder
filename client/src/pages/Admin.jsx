import { useEffect, useState } from "react";
import { api } from "../api/client.js";

export default function Admin() {
  const [products, setProducts] = useState([]);
  const [moderation, setModeration] = useState([]);
  const [savingId, setSavingId] = useState(null);
  const [uploadingId, setUploadingId] = useState(null);

  const loadProducts = () => api.get("/admin/products").then(({ data }) => setProducts(data));

  useEffect(() => {
    loadProducts();
    api.get("/admin/moderation").then(({ data }) => setModeration(data));
  }, []);

  const updateField = (productId, field, value) => {
    setProducts((prev) =>
      prev.map((p) => (p._id === productId ? { ...p, [field]: value } : p))
    );
  };

  const updateRuleField = (productId, field, value) => {
    setProducts((prev) =>
      prev.map((p) =>
        p._id === productId ? { ...p, unlockRule: { ...p.unlockRule, [field]: value } } : p
      )
    );
  };

  const getQuestionCount = (product) => {
    const title = product?.title?.toLowerCase() || "";
    return title.includes("fortune") || title.includes("conversation") ? 5 : 1;
  };

  const updateQuestion = (productId, index, value) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p._id !== productId) return p;
        const count = getQuestionCount(p);
        const current =
          p.promptQuestions?.length === count
            ? [...p.promptQuestions]
            : Array(count).fill("");
        current[index] = value;
        return { ...p, promptQuestions: current };
      })
    );
  };

  const uploadThumbnail = async (productId, file) => {
    if (!file) return;
    setUploadingId(productId);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const { data } = await api.post(`/admin/products/${productId}/thumbnail`, formData);
      updateField(productId, "sampleAssetUrl", data.sampleAssetUrl);
    } catch (err) {
      alert(err.response?.data?.error || "Image upload failed");
    } finally {
      setUploadingId(null);
    }
  };

  const save = async (product) => {
    setSavingId(product._id);
    try {
      await api.put(`/admin/products/${product._id}`, {
        title: product.title,
        description: product.description,
        coinPrice: Number(product.coinPrice),
        isActive: product.isActive,
        promptQuestions:
          product.promptQuestions?.length === getQuestionCount(product)
            ? product.promptQuestions
            : undefined,
      });
      await api.put(`/admin/unlock-rules/${product._id}`, {
        requiresLikes: Number(product.unlockRule?.requiresLikes ?? 0),
        requiresComments: !!product.unlockRule?.requiresComments,
        requiresSignup: !!product.unlockRule?.requiresSignup,
        requiresSharePlatforms: Number(product.unlockRule?.requiresSharePlatforms ?? 0),
      });
      alert(`Saved "${product.title}"`);
    } catch (err) {
      alert(err.response?.data?.error || "Save failed");
    } finally {
      setSavingId(null);
    }
  };

  const decide = async (jobId, decision) => {
    await api.put(`/admin/moderation/${jobId}`, { decision });
    setModeration((m) => m.filter((j) => j._id !== jobId));
  };

  return (
    <div className="space-y-10">
      <section>
        <h1 className="text-2xl font-bold mb-4">Catalogue</h1>
        <div className="space-y-6">
          {products.map((p) => {
            const questionCount = getQuestionCount(p);
            const questions =
              p.promptQuestions?.length === questionCount
                ? p.promptQuestions
                : Array(questionCount).fill("");
            return (
              <div key={p._id} className="bg-white rounded-xl p-5 shadow-sm space-y-3">
                <div className="flex gap-4">
                  <div className="shrink-0">
                    <img
                      src={p.sampleAssetUrl || "https://placehold.co/120x120/ED802A/E9CEAF?text=?"}
                      alt={p.title}
                      className="w-28 h-28 object-cover rounded-lg mb-2"
                    />
                    <label className="block text-xs text-center bg-blue text-ink rounded-full py-1 px-2 cursor-pointer hover:opacity-90">
                      {uploadingId === p._id ? "Uploading…" : "Change image"}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={uploadingId === p._id}
                        onChange={(e) => uploadThumbnail(p._id, e.target.files[0])}
                      />
                    </label>
                  </div>
                  <div className="flex-1 space-y-2">
                    <input
                      value={p.title}
                      onChange={(e) => updateField(p._id, "title", e.target.value)}
                      className="w-full border border-blue rounded p-2 font-semibold"
                      placeholder="Title"
                    />
                    <textarea
                      value={p.description}
                      onChange={(e) => updateField(p._id, "description", e.target.value)}
                      className="w-full border border-blue rounded p-2 text-sm"
                      placeholder="Description"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-sm">
                  <label className="flex flex-col gap-1">
                    Coin price
                    <input
                      type="number"
                      value={p.coinPrice}
                      onChange={(e) => updateField(p._id, "coinPrice", e.target.value)}
                      className="border border-blue rounded p-1"
                    />
                  </label>
                  <label className="flex flex-col gap-1">
                    Likes needed
                    <input
                      type="number"
                      value={p.unlockRule?.requiresLikes ?? 0}
                      onChange={(e) => updateRuleField(p._id, "requiresLikes", e.target.value)}
                      className="border border-blue rounded p-1"
                    />
                  </label>
                  <label className="flex flex-col gap-1">
                    Share platforms needed
                    <input
                      type="number"
                      value={p.unlockRule?.requiresSharePlatforms ?? 0}
                      onChange={(e) => updateRuleField(p._id, "requiresSharePlatforms", e.target.value)}
                      className="border border-blue rounded p-1"
                    />
                  </label>
                  <label className="flex items-center gap-2 mt-5">
                    <input
                      type="checkbox"
                      checked={!!p.unlockRule?.requiresComments}
                      onChange={(e) => updateRuleField(p._id, "requiresComments", e.target.checked)}
                    />
                    Requires comment
                  </label>
                  <label className="flex items-center gap-2 mt-5">
                    <input
                      type="checkbox"
                      checked={!!p.unlockRule?.requiresSignup}
                      onChange={(e) => updateRuleField(p._id, "requiresSignup", e.target.checked)}
                    />
                    Requires sign up
                  </label>
                </div>

                <div className="border-t border-cream pt-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink/50 mb-2">
                    Checkout questions (shown one at a time to the user — their answers become the AI prompt)
                  </p>
                  <div className="space-y-2">
                    {questions.map((q, i) => (
                      <input
                        key={i}
                        value={q}
                        onChange={(e) => updateQuestion(p._id, i, e.target.value)}
                        placeholder={`Question ${i + 1}`}
                        className="w-full border border-blue rounded p-2 text-sm"
                      />
                    ))}
                  </div>
                  {questions.some((q) => !q.trim()) && (
                    <p className="text-xs text-orange mt-1">
                      {questionCount === 1
                      ? 'The question needs text, or the generic "Tell us what you\'d like generated" fallback will show instead.'
                      : 'All 5 questions need text, or the generic "Tell us what you\'d like generated" fallback will show instead.'}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={p.isActive}
                      onChange={(e) => updateField(p._id, "isActive", e.target.checked)}
                    />
                    Active (visible on site)
                  </label>
                  <button
                    onClick={() => save(p)}
                    disabled={savingId === p._id}
                    className="bg-orange text-cream px-5 py-2 rounded-full text-sm font-semibold disabled:opacity-50"
                  >
                    {savingId === p._id ? "Saving…" : "Save changes"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Moderation queue</h2>
        {moderation.map((job) => (
          <div key={job._id} className="bg-white rounded-xl p-4 shadow-sm mb-2">
            <p className="text-sm text-ink/70 mb-2">{job.prompt}</p>
            <div className="flex gap-2">
              <button onClick={() => decide(job._id, "approved")} className="bg-blue px-3 py-1 rounded-full text-sm">Approve</button>
              <button onClick={() => decide(job._id, "rejected")} className="bg-orange text-cream px-3 py-1 rounded-full text-sm">Reject</button>
            </div>
          </div>
        ))}
        {moderation.length === 0 && <p className="text-ink/50 text-sm">Nothing pending review.</p>}
      </section>
    </div>
  );
}