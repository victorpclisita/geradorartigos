// api/wordpress.js
// Envia artigo como rascunho para o WordPress via API REST

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  const { titulo, conteudo, slug, metaTitle, metaDescription } = req.body;

  if (!conteudo || !titulo) {
    return res.status(400).json({ error: "Título e conteúdo são obrigatórios" });
  }

  const WP_URL      = process.env.WP_URL;
  const WP_USER     = process.env.WP_USER;
  const WP_PASSWORD = process.env.WP_PASSWORD;

  if (!WP_URL || !WP_USER || !WP_PASSWORD) {
    return res.status(500).json({ error: "Variáveis de ambiente do WordPress não configuradas" });
  }

  // Converte markdown para HTML básico
  function markdownParaHtml(md) {
    return md
      // Títulos
      .replace(/^# (.+)$/gm,   "<h1>$1</h1>")
      .replace(/^## (.+)$/gm,  "<h2>$1</h2>")
      .replace(/^### (.+)$/gm, "<h3>$1</h3>")
      // Negrito
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      // Links
      .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>')
      // Bullet points — agrupa linhas com "- " em <ul><li>
      .replace(/((?:^- .+\n?)+)/gm, (bloco) => {
        const itens = bloco.trim().split("\n").map(l => `<li>${l.replace(/^- /, "")}</li>`).join("\n");
        return `<ul>\n${itens}\n</ul>`;
      })
      // Parágrafos — linhas não-vazias que não são tags HTML
      .replace(/^(?!<[hulo]|<\/)(.*\S.*)$/gm, "<p>$1</p>")
      // Limpar linhas vazias múltiplas
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }

  const htmlConteudo = markdownParaHtml(conteudo);

  const payload = {
    title:   titulo,
    content: htmlConteudo,
    status:  "draft",
    slug:    slug || "",
    meta: {
      // Yoast SEO — só preenche se o plugin estiver ativo
      _yoast_wpseo_title:    metaTitle       || "",
      _yoast_wpseo_metadesc: metaDescription || "",
    },
  };

  const credencial = Buffer.from(`${WP_USER}:${WP_PASSWORD}`).toString("base64");

  try {
    const wpRes = await fetch(`${WP_URL}/wp-json/wp/v2/posts`, {
      method:  "POST",
      headers: {
        "Content-Type":  "application/json",
        "Authorization": `Basic ${credencial}`,
      },
      body: JSON.stringify(payload),
    });

    const dados = await wpRes.json();

    if (!wpRes.ok) {
      console.error("Erro WordPress:", dados);
      return res.status(wpRes.status).json({
        error: dados?.message || "Erro ao criar rascunho no WordPress",
        code:  dados?.code    || "unknown",
      });
    }

    return res.status(200).json({
      ok:      true,
      id:      dados.id,
      link:    dados.link,
      editUrl: `${WP_URL}/wp-admin/post.php?post=${dados.id}&action=edit`,
    });

  } catch (e) {
    console.error("Erro na requisição ao WordPress:", e);
    return res.status(500).json({ error: "Falha na conexão com o WordPress: " + e.message });
  }
}
