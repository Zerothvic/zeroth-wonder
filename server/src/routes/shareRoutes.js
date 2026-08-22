import { Router } from "express";
import Product from "../models/Product.js";

const router = Router();

function escapeHtml(str = "") {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// GET /share/product/:id — server-rendered HTML with real Open Graph tags,
// so social platforms' link-preview crawlers (which never run JS) see the
// correct product thumbnail, title, and description. Redirects real humans
// straight through to the actual React app page.
router.get("/product/:id", async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.redirect(process.env.CLIENT_URL);

  const pageUrl = `${process.env.CLIENT_URL}/products/${product._id}`;
  const imageUrl = product.sampleAssetUrl || `${process.env.CLIENT_URL}/images/default-og.png`;

  res.set("Content-Type", "text/html");
  res.send(`<!doctype html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>${escapeHtml(product.title)} — Zeroth Wonder</title>
  <meta property="og:title" content="${escapeHtml(product.title)} — Zeroth Wonder" />
  <meta property="og:description" content="${escapeHtml(product.description)}" />
  <meta property="og:image" content="${escapeHtml(imageUrl)}" />
  <meta property="og:url" content="${escapeHtml(pageUrl)}" />
  <meta property="og:type" content="website" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(product.title)} — Zeroth Wonder" />
  <meta name="twitter:description" content="${escapeHtml(product.description)}" />
  <meta name="twitter:image" content="${escapeHtml(imageUrl)}" />
  <meta http-equiv="refresh" content="0; url=${escapeHtml(pageUrl)}" />
</head>
<body>
  <p>Redirecting to <a href="${escapeHtml(pageUrl)}">${escapeHtml(product.title)}</a>…</p>
</body>
</html>`);
});

export default router;