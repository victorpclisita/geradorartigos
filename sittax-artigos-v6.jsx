import { useState, useRef, useEffect } from "react";

// ─── PROMPTS ──────────────────────────────────────────────────────────────────

const PROMPTS = {

  pesquisa: (tema) => `Você é especialista em SEO e conteúdo tributário/fiscal brasileiro.
TEMA: "${tema}"

IMPORTANTE: Responda SOMENTE com o JSON abaixo preenchido. Nenhum texto antes ou depois. Nenhum bloco de código. Apenas o JSON puro.

Busque na internet 1 dado recente (2025 ou 2026) sobre o tema — pode ser uma notícia, dado do IBGE, Sebrae, Receita Federal, IBPT ou portal tributário. Inclua o dado e a URL real encontrada no campo "dado_recente".

{
  "keyword_primaria": "keyword estratégica de 1-4 palavras para o tema",
  "keywords_secundarias": ["keyword lsi 1", "keyword lsi 2", "keyword lsi 3", "keyword lsi 4", "keyword lsi 5", "keyword lsi 6"],
  "intencao_busca": "Informacional",
  "angulo_diferenciado": "ângulo específico que diferencia este artigo de concorrentes genéricos",
  "dado_recente": { "fato": "dado concreto encontrado (número, percentual, estatística ou notícia recente de 2025/2026)", "fonte": "Nome do portal ou órgão", "url": "https://url-real-encontrada.com.br" },
  "secoes": [
    { "h2": "Título da seção 1", "h3s": ["subtópico a", "subtópico b"], "foco": "o que abordar nesta seção" },
    { "h2": "Título da seção 2", "h3s": [], "foco": "o que abordar nesta seção" },
    { "h2": "Título da seção 3", "h3s": [], "foco": "o que abordar nesta seção" }
  ],
  "faq_perguntas": ["Pergunta real 1?", "Pergunta real 2?", "Pergunta real 3?", "Pergunta real 4?"],
  "meta_title": "title tag até 60 caracteres com keyword",
  "meta_description": "meta description até 155 caracteres respondendo a intenção de busca diretamente",
  "slug": "slug-com-keyword",
  "fontes_primarias": ["Lei ou norma 1", "Lei ou norma 2"]
}`,

  // Parte 1: corpo principal (intro + seções) — ~900 palavras
  corpo: (tema, p) => `Você é consultor tributário sênior escrevendo para outros contadores e gestores contábeis. O leitor conhece o mercado — não explique o que é DAS, PGDAS, Simples Nacional, MEI ou conceitos básicos de contabilidade. Vá direto às implicações práticas, estratégias e decisões. NUNCA use linguagem de IA.

TEMA: "${tema}"
KEYWORD PRIMÁRIA: "${p.keyword_primaria}"
KEYWORDS SECUNDÁRIAS: ${p.keywords_secundarias.join(", ")}
ÂNGULO: ${p.angulo_diferenciado}
FONTES PRIMÁRIAS: ${p.fontes_primarias.join("; ")}
DADO RECENTE PARA USAR NO ARTIGO: "${p.dado_recente?.fato}" — Fonte: ${p.dado_recente?.fonte} — URL: ${p.dado_recente?.url}
SEÇÕES A ESCREVER:
${p.secoes.map((s, i) => (i + 1) + ". H2: \"" + s.h2 + "\" — Foco: " + s.foco + (s.h3s.length ? "\n   H3s sugeridos (use onde fizer sentido): " + s.h3s.join(", ") : "")).join("\n")}

REGRAS OBRIGATÓRIAS:
- Escreva APENAS: título H1 + introdução + as ${p.secoes.length} seções H2 acima
- NÃO inclua FAQ, conclusão nem CTA — serão escritos separadamente
- Meta OBRIGATÓRIA: mínimo 1.100 palavras nesta parte — escreva com profundidade real

INTRODUÇÃO (obrigatório):
- 2 a 3 parágrafos — não mais, não menos
- Primeiro parágrafo: impacto direto do tema com dado concreto ou número real na primeira frase
- Segundo parágrafo: aprofunda o contexto — o que está em jogo, o que mudou ou está mudando
- Terceiro parágrafo (opcional): o que o artigo vai mostrar ao leitor
- NÃO invente personagens, NÃO conte histórias fictícias, NÃO use "Imagine que..."
- Keyword primária aparece naturalmente no primeiro ou segundo parágrafo

DADO RECENTE (obrigatório):
- Insira o DADO RECENTE em uma seção onde se encaixe naturalmente, com hiperlink markdown
- Formato: [texto âncora descritivo](url)
- Exemplo: "Segundo o Sebrae, [mais de 60% das microempresas têm irregularidades no PGDAS](https://url)"

REGRA DE FONTES (obrigatório):
- Toda afirmação atribuída a um órgão, governo, lei ou pesquisa DEVE ter hiperlink para a fonte
- PROIBIDO citar "segundo a Receita Federal", "o governo anunciou", "conforme o IBGE" etc. sem linkar a fonte
- Se não tiver a URL real, reescreva a frase sem atribuir a fonte — use "conforme a legislação vigente" ou retire a atribuição

DADOS NUMÉRICOS (obrigatório):
- Preserve e utilize TODOS os dados numéricos fornecidos pela pesquisa (alíquotas, percentuais, prazos, valores)
- Verifique se são aplicáveis a 2026 — se sim, insira no contexto mais relevante do artigo
- NUNCA remova dados numéricos já presentes no rascunho — apenas reposicione se necessário

CADA SEÇÃO H2:
- Parágrafo introdutório logo após o título H2 — antes de qualquer H3
- Mínimo 4 parágrafos densos por seção (com ou sem H3s)
- H3s: use apenas quando subdividirem naturalmente o conteúdo — nunca logo após o H2 sem parágrafo introdutório
- OBRIGATÓRIO: ao menos uma seção H2 do artigo deve ter H3s — o artigo não pode ter zero H3s no total
- Frases curtas — máximo 2 linhas por frase
- Foco em estratégia e aplicação prática: o que fazer, como detectar, como orientar o cliente
- Ao menos 1 dado numérico por seção (alíquota, prazo, valor, percentual, multa)
- Cite fontes: "conforme a Lei Complementar 123/2006", "segundo a Receita Federal"
- NUNCA cite leis sem certeza — use "conforme a legislação tributária vigente" quando em dúvida

PROIBIDO (palavras que denunciam IA):
"No cenário atual", "É crucial", "Vale ressaltar", "Neste contexto", "Abrangente", "Robusto", "Em suma", "Transformador", "Mergulhe", "Navegar", "Multifacetado", "Dinâmico", "Paradigma", "Holístico", "Sinergias", "Delinear", "Alavancar", "Não se trata apenas de", "Mais do que nunca"

REGRA DE VOZ ATIVA (obrigatório):
- Máximo 10% das frases na voz passiva
- ERRADO: "o imposto é calculado pela Receita" | CERTO: "a Receita calcula o imposto"

REGRA DE TRANSIÇÃO (obrigatório):
- Pelo menos 30% das frases com palavra de transição — variando posição
- Use: portanto, assim, além disso, no entanto, por isso, dessa forma, ou seja, inclusive, conforme, já que, bem como, contudo, todavia, pois, logo

FORMATO EXATO:
# [Título H1 com keyword]

[Parágrafo 1: dado concreto + impacto direto]

[Parágrafo 2: contexto e o que está em jogo]

[Parágrafo 3 opcional: o que o artigo vai mostrar]

## [H2 da seção 1]

[Parágrafo introdutório obrigatório antes de qualquer H3]

### [H3 — só se houver subdivisão natural]
[parágrafos]

## [H2 da seção 2]

[Parágrafos — H3 opcional, nunca sem parágrafo introdutório antes]

## [H2 da seção 3]

[Parágrafos]`,

  // Parte 2: FAQ — ~350 palavras
  faq: (tema, p, corpo) => `Você é redator especialista da Sittax, consultoria tributária brasileira.

CONTEXTO: Artigo sobre "${tema}" (keyword: "${p.keyword_primaria}")
Início do artigo: ${corpo.slice(0, 250)}...

PERGUNTAS:
${p.faq_perguntas.map((q, i) => (i + 1) + ". " + q).join("\n")}

Escreva SOMENTE a seção FAQ com estas 4 perguntas.

REGRAS:
- Cada resposta começa com a resposta direta à pergunta — sem preamble
- 3-4 frases por resposta, curtas e objetivas
- Tom de contador que está respondendo um cliente pessoalmente: direto, sem enrolação
- Dados concretos quando aplicável (prazos, valores, percentuais)
- NUNCA cite leis sem certeza — use "conforme a legislação vigente" se em dúvida
- PROIBIDO: "É importante ressaltar", "Vale destacar", "É fundamental", "Neste contexto"
- Meta OBRIGATÓRIA: mínimo 350 palavras no total desta seção

FORMATO EXATO:
## Perguntas Frequentes

### [Pergunta 1]

[Resposta direta, 3-4 frases]

### [Pergunta 2]

[Resposta direta, 3-4 frases]

### [Pergunta 3]

[Resposta direta, 3-4 frases]

### [Pergunta 4]

[Resposta direta, 3-4 frases]`,

  // Parte 3: Conclusão — ~150 palavras
  conclusao: (tema, p) => `Escreva SOMENTE a seção de conclusão para um artigo da Sittax sobre "${tema}".

Regras:
- Título H2: "Conclusão"
- 2-3 parágrafos curtos
- Primeiro parágrafo: o que o leitor aprendeu — em termos práticos, não acadêmicos
- Segundo parágrafo: o que muda na prática para o empresário ou contador a partir de agora
- Tom de conversa: como se você estivesse encerrando uma reunião de consultoria
- Frases curtas. Sem enrolação.
- PROIBIDO: "Em suma", "Por fim", "Concluindo", "Em conclusão", "É crucial", "Vale ressaltar", "Neste contexto"
- Meta OBRIGATÓRIA: mínimo 150 palavras

FORMATO EXATO:
## Conclusão

[Parágrafo 1: o que o leitor aprendeu, em termos práticos]

[Parágrafo 2: o que fazer agora — passo concreto]`,

  // Parte 4: CTA — ~80 palavras
  cta: (tema, p) => `Escreva SOMENTE um parágrafo de CTA para um artigo da Sittax sobre "${tema}".

Regras:
- 2-3 frases, tom consultivo e direto
- Convide o leitor a falar com a Sittax para analisar o caso específico
- Mencione que cada empresa tem uma situação única
- PROIBIDO: "Em suma", "Por fim", "Concluindo", "Portanto", "Transforme"
- Comece com uma frase sobre o impacto prático do tema

Retorne apenas o parágrafo, sem título, sem marcadores.`,

  // Expansão automática — acionada se artigo < 1.500 palavras após montagem
  expansao: (textoCompleto, palavrasAtuais) => `Você é redator especialista da Sittax, consultoria tributária brasileira.

O artigo abaixo está com ${palavrasAtuais} palavras. Precisa ter no mínimo 1.500 palavras.
Faltam aproximadamente ${1500 - palavrasAtuais} palavras.

SUA TAREFA: Expandir o artigo até atingir pelo menos 1.500 palavras, sem perder qualidade.

COMO EXPANDIR:
- Aprofunde as seções H2 existentes com mais detalhes práticos, exemplos concretos ou casos de uso
- Adicione dados numéricos relevantes (alíquotas, prazos, valores) onde faltarem
- Expanda as respostas do FAQ com mais contexto e orientações práticas
- NÃO crie novas seções H2 — expanda o que já existe
- NÃO repita informações já presentes
- Mantenha o tom de contador experiente, sem linguagem de IA
- Preserve toda a estrutura de títulos (# ## ###) e links existentes
- PROIBIDO: "No cenário atual", "É crucial", "Vale ressaltar", "Robusto", "Abrangente"

Retorne o artigo completo expandido, com todos os marcadores # ## ###.

ARTIGO ATUAL:
${textoCompleto}`,

  // Etapa de polimento Yoast — corrige transição e voz passiva antes da auditoria
  polimento: (textoCompleto) => `Você é revisor especialista em legibilidade de textos em português brasileiro.

Sua única tarefa é reescrever o artigo abaixo para atingir dois critérios obrigatórios:

CRITÉRIO 1 — PALAVRAS DE TRANSIÇÃO (meta: ≥ 30% das frases)
Percorra cada frase do artigo. Se menos de 30% delas contiver uma palavra/expressão de transição, adicione conectivos naturais nas frases que estiverem "soltas". IMPORTANTE: insira as transições em posições variadas — início, meio ou fim da frase — para soar natural. Não coloque transição sempre no começo da frase.
Palavras válidas (use com naturalidade): portanto, assim, além disso, no entanto, por isso, dessa forma, ou seja, ainda assim, conforme, por outro lado, já que, uma vez que, bem como, em seguida, por exemplo, contudo, todavia, inclusive, pois, logo, apesar disso, de fato, ao mesmo tempo, mesmo que, anteriormente, posteriormente, igualmente, salvo, sobretudo, certamente, então, entretanto, ademais, aliás, afinal, principalmente

CRITÉRIO 2 — VOZ ATIVA (meta: ≤ 10% das frases em voz passiva)
Identifique frases com construções passivas (ser/estar/foi/são/foram/será/serão + particípio) e reescreva-as na voz ativa.
- "o imposto é calculado pela Receita" → "a Receita calcula o imposto"
- "as alíquotas foram aprovadas pelo Congresso" → "o Congresso aprovou as alíquotas"
- "a declaração deve ser entregue" → "o contribuinte deve entregar a declaração"

REGRAS:
- Mexa APENAS nas frases que precisam de ajuste — não reescreva o que já está correto
- Preserve todo o conteúdo, dados, links e estrutura de títulos (# ## ###)
- Preserve todos os links markdown [texto](url) exatamente como estão
- Não corte nenhuma seção, parágrafo ou frase — APENAS adicione conectivos ou ajuste a voz
- Não altere fatos, números, leis ou nomes
- Não adicione nem remova seções
- O artigo de saída deve ter o mesmo número de palavras (±5%) que o artigo de entrada
- As mudanças devem soar naturais — nunca mecânicas ou forçadas

Retorne APENAS o artigo completo, com todos os marcadores # ## ###.
Sem explicações, sem comentários fora do artigo.

ARTIGO:
${textoCompleto}`,

  auditoria: (textoCompleto, rodada) => `Você é editor-chefe de conteúdo tributário brasileiro. Audite este artigo com rigor — rodada ${rodada} de revisão.

ARTIGO COMPLETO:
${textoCompleto}

═══════════════════════════════════════════
CRITÉRIO A — CONTEÚDO E ESTRUTURA
═══════════════════════════════════════════
1. LEGISLAÇÃO: cite apenas leis com certeza absoluta. Se não tiver certeza, marque como problema.
2. COMPLETUDE: todas as seções H2 devem ter conteúdo completo, sem corte no meio.
3. LINGUAGEM IA: frases que soam como IA ("no cenário atual", "é crucial", "vale ressaltar", "robusto", "abrangente", "transformador", linguagem corporativa vaga) são problemas.
4. DADOS: números e percentuais sem fonte identificável são problema.
5. FAQ: deve ter exatamente 4 perguntas com respostas completas.
6. CONCLUSÃO: deve ter seção H2 "Conclusão" com 2 parágrafos.
7. CTA: deve ter parágrafo final convidando a falar com a Sittax.
8. HIPERLINKS: conte os hiperlinks markdown [texto](url) no artigo. O artigo deve ter no mínimo 4 hiperlinks. Se tiver menos de 4, marque como problema listando quantos há e quantos faltam.

═══════════════════════════════════════════
CRITÉRIO B — PALAVRAS DE TRANSIÇÃO (Yoast)
═══════════════════════════════════════════
META: mínimo 30% das frases devem conter pelo menos uma palavra de transição.
- Verde (ok): ≥ 30% das frases
- Laranja (atenção): entre 20% e 30%
- Vermelho (problema): < 20% das frases

LISTA COMPLETA DE PALAVRAS DE TRANSIÇÃO VÁLIDAS:
Palavras simples: ademais, afinal, aliás, analogamente, anteriormente, assim, atualmente, certamente, conforme, conquanto, contudo, decerto, embora, enfim, enquanto, então, entretanto, eventualmente, igualmente, inegavelmente, inesperadamente, mas, ocasionalmente, outrossim, pois, porquanto, porque, portanto, posteriormente, precipuamente, primeiramente, primordialmente, principalmente, salvo, semelhantemente, similarmente, sobretudo, surpreendentemente, todavia, logo, inclusive

Expressões compostas: a fim de, a fim de que, a menos que, a princípio, a saber, acima de tudo, ainda assim, ainda mais, ainda que, além disso, antes de mais nada, antes de tudo, antes que, ao mesmo tempo, ao passo que, ao propósito, apesar de, apesar disso, às vezes, assim como, assim que, assim sendo, assim também, bem como, com a finalidade de, com efeito, com o fim de, com o intuito de, com o propósito de, com toda a certeza, como resultado, como se, da mesma forma, de acordo com, de conformidade com, de fato, de maneira idêntica, de tal forma que, de tal sorte que, depois que, desde que, dessa forma, dessa maneira, desse modo, do mesmo modo, é provável, em conclusão, em contrapartida, em contraste com, em outras palavras, em primeiro lugar, em princípio, em resumo, em seguida, em segundo lugar, em síntese, em suma, em terceiro lugar, em virtude de, finalmente, isto é, já que, juntamente com, logo após, logo depois, logo que, mesmo que, não apenas, nesse hiato, nesse ínterim, nesse meio tempo, nesse sentido, no entanto, no momento em que, ou por outra, ou seja, para que, pelo contrário, por analogia, por causa de, por certo, por conseguinte, por consequência, porém, por exemplo, por fim, por isso, por mais que, por menos que, por outro lado, por vezes, posto que, se acaso, se bem que, seja como for, sem dúvida, sempre que, só que, sob o mesmo ponto de vista, tanto quanto, todas as vezes que, uma vez que, visto que, de repente, não obstante, de qualquer forma, em geral, geralmente, devido a, em razão de, de forma que, de modo que

COMO CALCULAR:
1. Conte o total de frases do artigo (separe por "." "!" "?")
2. Para cada frase, verifique se contém alguma das palavras/expressões acima
3. Calcule: (frases com transição / total de frases) × 100
4. Reporte o percentual e a classificação (verde/laranja/vermelho)
5. Se laranja ou vermelho, liste exemplos de frases sem transição que poderiam receber uma

═══════════════════════════════════════════
CRITÉRIO C — VOZ PASSIVA (Yoast)
═══════════════════════════════════════════
META: máximo 10% das frases podem estar na voz passiva.
- Verde (ok): ≤ 10% das frases em voz passiva
- Vermelho (problema): > 10% das frases em voz passiva

Voz passiva em português: construções com "ser/estar/foi/são/foram/será/serão + particípio" (ex: "é definido", "foram aprovadas", "será regulamentado").

COMO CALCULAR:
1. Identifique frases com construções passivas
2. Calcule: (frases passivas / total de frases) × 100
3. Reporte o percentual e a classificação
4. Se vermelho, liste as frases passivas que devem ser reescritas na voz ativa

═══════════════════════════════════════════
ATENÇÃO FINAL
═══════════════════════════════════════════
- "aprovado" só pode ser true se score_geral >= 90
- Score abaixo de 90 significa que há pelo menos um problema crítico nos critérios A, B ou C

Responda SOMENTE em JSON válido, sem markdown:
{
  "score_geral": 87,
  "aprovado": false,
  "problemas": [
    "Problemas concretos. Ex: 'LC 214/2025 não existe', 'Conclusão ausente', 'Apenas 18% das frases têm transição — abaixo do mínimo de 30%', 'Voz passiva em 15% das frases — acima do limite de 10%: [lista as frases]'. Array vazio [] se não houver."
  ],
  "checklist": {
    "h1_com_keyword": true,
    "introducao_direta": true,
    "dados_numericos": true,
    "legislacao_verificavel": true,
    "faq_completo_4_perguntas": true,
    "conclusao_presente": true,
    "cta_presente": true,
    "sem_linguagem_ia": true,
    "todas_secoes_completas": true,
    "transicao_yoast_verde": true,
    "voz_passiva_yoast_verde": true,
    "minimo_4_hiperlinks": true
  },
  "yoast": {
    "total_frases": 45,
    "frases_com_transicao": 15,
    "percentual_transicao": 33,
    "status_transicao": "verde",
    "frases_passivas": 3,
    "percentual_passiva": 7,
    "status_passiva": "verde"
  },
  "resumo": "Veredicto objetivo em 1-2 frases"
}`,

  // Etapa de busca de fontes — Claude retorna JSON com URLs reais (leve)
  buscarFontes: (textoCompleto) => `Você é especialista em fontes do direito tributário brasileiro.

Analise o trecho abaixo e identifique menções a leis, normas, dados e afirmações atribuídas a órgãos ou entidades.
Para cada item encontrado, busque a URL real na internet e retorne como fonte linkável.

Portais aceitos como fonte:
Governo: planalto.gov.br, gov.br/receitafederal, normas.receita.fazenda.gov.br, pgfn.gov.br, sefaz estaduais
Entidades: cfc.org.br, fenacon.org.br, sebrae.com.br, ibge.gov.br, ibpt.com.br, cni.org.br, fecomercio.com.br, fgv.br
Portais contábeis: contabeis.com.br, tax contábil (taxcontabil.com.br), tributanet.com.br
Notícias: g1.globo.com, valor.globo.com, exame.com, estadao.com.br, folha.uol.com.br, cnnbrasil.com.br

Retorne APENAS um JSON puro, sem texto antes ou depois:
{"fontes":[{"ancora":"texto exato que aparece no artigo","url":"https://url-real-encontrada.com.br"}]}

Máximo 4 fontes. Só inclua URLs que você confirmou na internet — NUNCA invente.
Se não encontrar nenhuma, retorne: {"fontes":[]}

TRECHO DO ARTIGO (primeiros 800 caracteres):
${textoCompleto.slice(0, 800)}`,

  // Etapa de inserção de fontes — ChatGPT insere os links no texto
  inserirFontes: (textoCompleto, fontes) => `Você é editor de conteúdo da Sittax.

Insira os links de fontes abaixo no artigo, nos trechos exatos onde as âncoras aparecem.

FONTES DISPONÍVEIS:
${fontes.map((f, i) => (i+1) + '. ancora: "' + f.ancora + '" → ' + f.url).join('\n')}

REGRAS:
- Formato markdown: [âncora](url)
- Use a âncora exata fornecida para encontrar o ponto de inserção no texto
- Máximo 1 link por fonte
- Não altere nenhuma outra parte do texto
- Preserve todos os links já existentes
- PROIBIDO: texto fora do artigo, explicações, comentários

Retorne APENAS o artigo completo. Comece diretamente com o # do título.

ARTIGO:
${textoCompleto}`,

  // Etapa de links internos — busca artigos do blog Sittax e linka palavras relevantes
  linksInternos: (textoCompleto, tema) => `Você é especialista em SEO e conteúdo da Sittax. Sua tarefa é inserir links internos do blog da Sittax (sittax.com.br/blog/) no artigo abaixo.

PASSO 1 — Use web_search para buscar artigos relevantes do blog Sittax:
- Faça buscas como: site:sittax.com.br/blog [termo do tema]
- Termos a buscar baseados no tema "${tema}": use 3-4 variações de keywords relevantes
- Colete os URLs reais encontrados e os títulos dos artigos

PASSO 2 — Para cada artigo encontrado com URL real e confirmado:
- Identifique no texto abaixo uma palavra ou expressão que seja o âncora ideal para aquele link
- O âncora deve ser natural, específico e relevante (ex: "Simples Nacional", "reforma tributária", "ICMS-ST", "recuperação de créditos tributários")
- Insira o link no formato markdown: [âncora](https://sittax.com.br/blog/...)

REGRAS:
- Máximo 4 links internos no total
- Nunca repita o mesmo URL
- Só insira links de artigos que você realmente encontrou via web_search — NUNCA invente URLs
- O âncora deve aparecer naturalmente na frase, sem forçar
- Não altere nenhuma outra parte do texto — apenas insira os links nos locais exatos
- Preserve todos os links externos já existentes no texto (fontes de legislação etc.)

Retorne APENAS o artigo completo com os links internos inseridos, mantendo todos os marcadores # ## ###.
PROIBIDO incluir qualquer texto antes ou depois do artigo: sem explicações, sem lista de artigos encontrados, sem comentários sobre o processo, sem "Após realizar a pesquisa...", sem "Vou usar web_search...".
A sua resposta deve começar diretamente com o título # do artigo e terminar na última linha do artigo.

ARTIGO:
${textoCompleto}`,

  linksInternos: (textoCompleto, artigos) => `Você é especialista em SEO da Sittax.

Insira os links internos abaixo no artigo, nos trechos mais relevantes.

LINKS DISPONÍVEIS:
${artigos.map((a, i) => (i+1) + ". [" + a.titulo + "](" + a.url + ") — " + a.relevancia).join("\n")}

REGRAS:
- Máximo 4 links internos no total
- Formato markdown: [âncora natural](url)
- O âncora deve ser uma expressão já existente no texto — não adicione texto novo
- Não altere nenhuma outra parte do texto
- Preserve todos os links externos já existentes
- PROIBIDO: texto fora do artigo, explicações, comentários

Retorne APENAS o artigo completo. Comece diretamente com o # do título.

ARTIGO:
${textoCompleto}`,

  buscaLinksInternos: (tema) => `Você é especialista em SEO da Sittax.

Use web_search para encontrar artigos reais do blog da Sittax relacionados ao tema "${tema}".
Faça 3-4 buscas variadas como: site:sittax.com.br/blog [keyword do tema]

Retorne APENAS um JSON com os artigos encontrados, sem texto antes ou depois:
{
  "artigos": [
    { "titulo": "Título do artigo", "url": "https://sittax.com.br/blog/slug-do-artigo", "relevancia": "por que é relevante para o tema" },
    { "titulo": "Título do artigo 2", "url": "https://sittax.com.br/blog/slug-2", "relevancia": "motivo" }
  ]
}
Máximo 4 artigos. Só inclua URLs que você realmente encontrou — NUNCA invente.`,

  inserirLinksInternos: (textoCompleto, artigos) => `Você é especialista em SEO da Sittax.

Insira os links internos abaixo no artigo, nos trechos mais relevantes.

LINKS DISPONÍVEIS:
${artigos.map((a, i) => (i+1) + ". [" + a.titulo + "](" + a.url + ") — " + a.relevancia).join("\n")}

REGRAS:
- Máximo 4 links internos no total
- Formato markdown: [âncora natural](url)
- O âncora deve ser uma expressão já existente no texto — não adicione texto novo
- Não altere nenhuma outra parte do texto
- Preserve todos os links externos já existentes
- PROIBIDO: texto fora do artigo, explicações, comentários

Retorne APENAS o artigo completo. Comece diretamente com o # do título.

ARTIGO:
${textoCompleto}`,

  revisar: (textoCompleto, problemas) => `Você é redator especialista da Sittax. Reescreva o artigo abaixo corrigindo TODOS os problemas listados.

PROBLEMAS A CORRIGIR:
${problemas.map((p, i) => `${i + 1}. ${p}`).join("\n")}

REGRAS DA REESCRITA:
- Corrija cada problema listado acima
- NUNCA invente ou cite leis que você não tem certeza que existem. Use "conforme a legislação tributária vigente" quando em dúvida
- Mantenha toda a estrutura de títulos (# ## ###) e o tamanho aproximado
- Não corte nenhuma seção — todas devem ter conteúdo completo
- Mantenha FAQ com 4 perguntas, Conclusão e CTA no final
- Linguagem de contador experiente, direta, sem marcadores de IA

SE HOUVER PROBLEMA DE PALAVRAS DE TRANSIÇÃO (meta: ≥ 30% das frases):
- Adicione conectivos naturais em posições variadas — início, meio ou fim das frases isoladas. Não coloque transição sempre no início: prefira inserir no meio da frase quando possível (ex: "A empresa, portanto, deve..." ou "Esse prazo vale inclusive para...")
- Use palavras da lista: portanto, assim, além disso, no entanto, por isso, dessa forma, ou seja, ainda assim, conforme, por outro lado, já que, uma vez que, bem como, em seguida, por exemplo, contudo, todavia, inclusive, pois, logo
- Não force — insira apenas onde a transição for natural e melhore a leitura

SE HOUVER PROBLEMA DE VOZ PASSIVA (meta: ≤ 10% das frases):
- Reescreva as frases passivas identificadas na voz ativa
- Ex: "o imposto é calculado pela Receita" → "a Receita calcula o imposto"
- Ex: "as alíquotas foram definidas pela lei" → "a lei definiu as alíquotas"

SE HOUVER PROBLEMA DE HIPERLINKS (meta: mínimo 4 no artigo):
- Adicione hiperlinks reais nos trechos que citam leis, órgãos, dados ou fontes
- Formato markdown: [âncora natural](url)
- Use URLs reais de: planalto.gov.br, gov.br/receitafederal, contabeis.com.br, sebrae.com.br, ibge.gov.br, cfc.org.br, fenacon.org.br, g1.globo.com, valor.globo.com
- NUNCA invente URLs — só insira links de fontes que você conhece com certeza

ARTIGO ORIGINAL:
${textoCompleto}

Retorne o artigo completo corrigido, com todos os marcadores de formatação (# ## ###).`,
};

// ─── API (chama o backend via URL relativa — funciona local e no Vercel) ─────

async function callGroq(prompt, maxTokens) {
  const res = await fetch("/api/gerar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, maxTokens }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || `Erro no servidor (${res.status})`);
  }
  const data = await res.json();
  return data.texto || "";
}

// Etapas de fontes/links — com web_search no backend
async function callGroqComSearch(prompt, maxTokens) {
  const res = await fetch("/api/pesquisar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, maxTokens }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || `Erro no servidor (${res.status})`);
  }
  const data = await res.json();
  return data.texto || "";
}

// Pausa com countdown visível no log da UI
const pausa = (seg, motivo, logFn) => new Promise(resolve => {
  if (logFn) logFn(`⏳ Aguardando ${seg}s (limite de tokens)...`, "info");
  setTimeout(resolve, seg * 1000);
});

function parseJSON(text) {
  if (!text) return null;
  // 1. Limpar blocos de código markdown
  let clean = text.replace(/```json|```/g, "").trim();
  // 2. Tentar parse direto
  try { return JSON.parse(clean); } catch (_) { }
  // 3. Extrair o primeiro bloco { ... } encontrado no texto
  const match = clean.match(/\{[\s\S]*\}/);
  if (match) {
    try { return JSON.parse(match[0]); } catch (_) { }
  }
  // 4. Falhou — retornar null com log
  console.error("parseJSON falhou. Texto recebido:", text.slice(0, 500));
  return null;
}

function contarPalavras(texto) {
  return texto.trim().split(/\s+/).filter(Boolean).length;
}

// ─── Gerador HTML para download ───────────────────────────────────────────────

function escHtml(s) {
  if (!s) return "";
  // 1. Escapar caracteres especiais HTML (exceto & que pode vir de links)
  let r = s
    .replace(/&(?![a-zA-Z0-9#]+;)/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  // 2. Negrito e itálico
  r = r
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>");
  // 3. Links markdown [texto](url) → <a href="url" target="_blank">texto</a>
  //    Processar ANTES de outros escapes para não quebrar URLs
  r = r.replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g,
    (_, texto, url) => `<a href="${url}" target="_blank" rel="noopener noreferrer" style="color:#1d4ed8;text-decoration:underline;">${texto}</a>`
  );
  return r;
}

function gerarHtml(artigo, pesquisa) {
  const lines = artigo.split("\n");
  const parts = [];

  for (const line of lines) {
    const t = line.trim();
    if (t.startsWith("### ")) parts.push(`<h3>${escHtml(t.slice(4).trim())}</h3>`);
    else if (t.startsWith("## ")) parts.push(`<h2>${escHtml(t.slice(3).trim())}</h2>`);
    else if (t.startsWith("# ")) parts.push(`<h1>${escHtml(t.slice(2).trim())}</h1>`);
    else if (/^[-*]\s/.test(t)) parts.push(`<li>${escHtml(t.slice(2).trim())}</li>`);
    else if (t) parts.push(`<p>${escHtml(t)}</p>`);
  }

  const body = parts.join("\n").replace(/(<li>[\s\S]*?<\/li>\n?)+/g, m => `<ul>\n${m}</ul>\n`);

  const p = pesquisa || {};
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>${escHtml(p.meta_title || p.keyword_primaria || "Artigo Sittax")}</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:Arial,Helvetica,sans-serif;font-size:11pt;line-height:1.72;color:#1f2937;max-width:780px;margin:0 auto;padding:40px 48px}
    .meta{background:#eff6ff;border:1px solid #bfdbfe;border-radius:6px;padding:14px 18px;margin-bottom:32px;font-size:9pt;line-height:2}
    .ml{font-weight:700;color:#1d4ed8}
    .aviso{background:#fef3c7;border:1px solid #fde68a;border-radius:6px;padding:12px 16px;margin-bottom:24px;font-size:10.5pt;color:#92400e}
    h1{font-size:20pt;font-weight:700;color:#111827;line-height:1.25;margin-bottom:18px;padding-bottom:12px;border-bottom:2.5px solid #1d4ed8}
    h2{font-size:13.5pt;font-weight:700;color:#1d4ed8;margin-top:30px;margin-bottom:10px}
    h3{font-size:11pt;font-weight:700;color:#374151;margin-top:16px;margin-bottom:6px}
    p{margin-bottom:11px;text-align:justify}
    a{color:#1d4ed8;text-decoration:underline}
    a:hover{color:#1e40af}
    ul{margin:8px 0 14px 24px}
    li{margin-bottom:6px}
    @page{margin:2cm 2.2cm;size:A4}
    @media print{body{padding:0}.aviso{display:none}h1,h2{page-break-after:avoid}p,li{orphans:3;widows:3}}
  </style>
</head>
<body>
  <div class="aviso"><strong>Para salvar como PDF:</strong> pressione <strong>Ctrl+P</strong> → destino <strong>"Salvar como PDF"</strong> → Salvar.</div>
  <div class="meta">
    <div style="font-weight:700;color:#1d4ed8;font-size:8pt;text-transform:uppercase;letter-spacing:.08em;margin-bottom:6px">Metadados para o WordPress</div>
    ${p.meta_title ? `<div><span class="ml">Meta Title:</span> ${escHtml(p.meta_title)}</div>` : ""}
    ${p.meta_description ? `<div><span class="ml">Meta Desc:</span> ${escHtml(p.meta_description)}</div>` : ""}
    ${p.slug ? `<div><span class="ml">Slug:</span> ${escHtml(p.slug)}</div>` : ""}
    ${p.keyword_primaria ? `<div><span class="ml">Keyword:</span> ${escHtml(p.keyword_primaria)}</div>` : ""}
    ${p.keywords_secundarias ? `<div><span class="ml">Keywords sec.:</span> ${p.keywords_secundarias.join(", ")}</div>` : ""}
  </div>
  ${body}
</body>
</html>`;
}

function baixarHtml(artigo, pesquisa) {
  const html = gerarHtml(artigo, pesquisa);
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `sittax-${(pesquisa?.slug || "artigo").replace(/\s+/g, "-").toLowerCase()}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 3000);
}

// ─── COMPONENTE ───────────────────────────────────────────────────────────────

const BRAND = {
  primary: "#F26B37",
  primaryDark: "#D4501E",
  primaryLight: "#FEF0EA",
  primaryBorder: "#FAC4A8",
  bg: "#FAFAFA",
  card: "#FFFFFF",
  border: "#E8E8E8",
  text: "#1A1A1A",
  textMuted: "#6B6B6B",
  textLight: "#9E9E9E",
  success: "#1A7F4B",
  successBg: "#EDFAF3",
  successBorder: "#A3E4C1",
  warn: "#7A4F00",
  warnBg: "#FFF8E6",
  warnBorder: "#F5D589",
  error: "#B91C1C",
  errorBg: "#FEF2F2",
  errorBorder: "#FECACA",
  font: "'Inter', system-ui, sans-serif",
  radius: "4px",
  radiusMd: "6px",
  radiusLg: "8px",
};

const FASES = [
  { id: "pesquisa",       label: "Pesquisa",    icon: "🔍" },
  { id: "corpo",          label: "Corpo",       icon: "✍️" },
  { id: "faq",            label: "FAQ",         icon: "❓" },
  { id: "cta",            label: "Concl./CTA",  icon: "🎯" },
  { id: "polimento",      label: "Polimento",   icon: "✨" },
  { id: "auditoria1",     label: "Auditoria 1", icon: "🔎" },
  { id: "revisao1",       label: "Revisão 1",   icon: "🛠️" },
  { id: "fontes",         label: "Fontes",      icon: "🔗" },
  { id: "auditoria2",     label: "Auditoria 2", icon: "🔎" },
  { id: "revisao2",       label: "Revisão 2",   icon: "✅" },
  { id: "pronto",         label: "Pronto",      icon: "🎉" },
];

export default function App() {
  const [tema,         setTema]         = useState("");
  const [keyAnthropic, setKeyAnthropic] = useState("");
  const [fase,         setFase]         = useState("idle");
  const [melhorando,   setMelhorando]   = useState(false);
  const [log,          setLog]          = useState([]);
  const [pesquisa,     setPesquisa]     = useState(null);
  const [artigo,       setArtigo]       = useState("");
  const [audit,        setAudit]        = useState(null);
  const [erro,         setErro]         = useState("");
  const logRef = useRef(null);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [log]);

  const log_ = (msg, tipo = "info") =>
    setLog(prev => [...prev, { msg, tipo, ts: new Date().toLocaleTimeString("pt-BR") }]);

  // Detecta se o erro é de rate limit
  function isRateLimit(msg) {
    return typeof msg === "string" && (
      msg.includes("rate limit") ||
      msg.includes("Rate limit") ||
      msg.includes("tokens per minute") ||
      msg.includes("429")
    );
  }

  // Chama o backend Vercel → Anthropic (Claude) com retry automático
  async function callClaude(prompt, maxTokens, tentativa = 1) {
    const res = await fetch("/api/gerar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, maxTokens, apiKey: keyAnthropic }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      const msg = err?.error || `Erro no servidor (${res.status})`;
      if (isRateLimit(msg) && tentativa <= 3) {
        const espera = 60 * tentativa;
        log_(`⏳ Limite de tokens atingido — aguardando ${espera}s e tentando novamente (${tentativa}/3)...`, "warn");
        await pausa(espera, "", null);
        return callClaude(prompt, maxTokens, tentativa + 1);
      }
      throw new Error(msg);
    }
    return (await res.json()).texto || "";
  }

  // Chama o backend Vercel → Anthropic com web_search e retry automático
  async function callClaudeSearch(prompt, maxTokens, tentativa = 1) {
    const res = await fetch("/api/pesquisar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, maxTokens, apiKey: keyAnthropic }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      const msg = err?.error || `Erro no servidor (${res.status})`;
      if (isRateLimit(msg) && tentativa <= 3) {
        const espera = 60 * tentativa;
        log_(`⏳ Limite de tokens atingido — aguardando ${espera}s e tentando novamente (${tentativa}/3)...`, "warn");
        await pausa(espera, "", null);
        return callClaudeSearch(prompt, maxTokens, tentativa + 1);
      }
      throw new Error(msg);
    }
    return (await res.json()).texto || "";
  }

  // Chama o backend Vercel → OpenAI (GPT-4o) com retry automático
  async function callGPT(prompt, maxTokens, tentativa = 1) {
    const res = await fetch("/api/auditar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, maxTokens }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      const msg = err?.error || `Erro OpenAI (${res.status})`;
      if (isRateLimit(msg) && tentativa <= 3) {
        const espera = 60 * tentativa;
        log_(`⏳ Limite de tokens OpenAI — aguardando ${espera}s e tentando novamente (${tentativa}/3)...`, "warn");
        await pausa(espera, "", null);
        return callGPT(prompt, maxTokens, tentativa + 1);
      }
      throw new Error(msg);
    }
    return (await res.json()).texto || "";
  }

  async function gerar() {
    if (!tema.trim()) return;
    setLog([]); setErro(""); setArtigo("");
    setPesquisa(null); setAudit(null);

    try {
      setFase("pesquisa");
      log_("Definindo estratégia de keywords e estrutura... (ChatGPT)");
      const rawP = await callGPT(PROMPTS.pesquisa(tema), 1500);
      const pd = parseJSON(rawP);
      if (!pd) throw new Error(`Resposta inválida da API na pesquisa. Conteúdo: "${rawP.slice(0, 120)}..."`);
      if (!pd.keyword_primaria) throw new Error("JSON retornado sem campo 'keyword_primaria'. Tente novamente.");

      pd.keywords_secundarias = pd.keywords_secundarias || [];
      pd.secoes = pd.secoes || [
        { h2: `O que é ${tema}`, h3s: [], foco: "Explicar o conceito e contexto" },
        { h2: `Como funciona na prática`, h3s: [], foco: "Aplicação prática e exemplos" },
        { h2: `Impacto para empresas`, h3s: [], foco: "Consequências e cuidados" },
      ];
      pd.faq_perguntas = pd.faq_perguntas || [
        `O que muda com ${tema}?`, `Quais empresas são afetadas?`,
        `Qual o prazo para adequação?`, `Como a Sittax pode ajudar?`,
      ];
      pd.fontes_primarias = pd.fontes_primarias || ["Legislação tributária vigente"];
      pd.meta_title = pd.meta_title || `${tema} — Guia Completo | Sittax`.slice(0, 60);
      pd.meta_description = pd.meta_description || `Entenda ${tema} com clareza. A Sittax explica o impacto para sua empresa.`.slice(0, 155);
      pd.slug = pd.slug || tema.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").slice(0, 60);

      setPesquisa(pd);
      log_(`✓ Keyword: "${pd.keyword_primaria}"`, "ok");
      log_(`✓ Intenção: ${pd.intencao_busca || "Informacional"}`, "ok");
      log_(`✓ ${pd.secoes.length} seções + ${pd.faq_perguntas.length} FAQs planejados`, "ok");

      setFase("corpo");
      log_("Escrevendo introdução e seções principais... (ChatGPT)");
      await pausa(2, "", log_);
      const corpoPart = await callGPT(PROMPTS.corpo(tema, pd), 2500);
      if (corpoPart.length < 400) throw new Error("Corpo do artigo muito curto. Tente um tema mais específico.");
      log_(`✓ Corpo: ~${contarPalavras(corpoPart)} palavras`, "ok");

      setFase("faq");
      log_("Escrevendo seção de Perguntas Frequentes... (ChatGPT)");
      await pausa(2, "", log_);
      const faqPart = await callGPT(PROMPTS.faq(tema, pd, corpoPart), 900);
      if (faqPart.length < 100) throw new Error("FAQ não gerado corretamente.");
      log_(`✓ FAQ: ~${contarPalavras(faqPart)} palavras`, "ok");

      setFase("cta");
      log_("Escrevendo conclusão... (ChatGPT)");
      await pausa(2, "", log_);
      const conclusaoPart = await callGPT(PROMPTS.conclusao(tema, pd), 400);
      log_(`✓ Conclusão: ~${contarPalavras(conclusaoPart)} palavras`, "ok");

      log_("Escrevendo CTA... (ChatGPT)");
      await pausa(2, "", log_);
      const ctaPart = await callGPT(PROMPTS.cta(tema, pd), 300);
      log_(`✓ CTA: ~${contarPalavras(ctaPart)} palavras`, "ok");

      const textoCompleto = `${corpoPart}\n\n${faqPart}\n\n${conclusaoPart}\n\n${ctaPart}`;
      setArtigo(textoCompleto);
      const totalPalavras = contarPalavras(textoCompleto);
      log_(`✓ Total montado: ${totalPalavras} palavras`, totalPalavras >= 1500 ? "ok" : "warn");

      let textoFinal = textoCompleto;

      // ── Expansão automática se abaixo de 1.500 palavras ──────────────────
      if (totalPalavras < 1500) {
        log_(`⚠ Artigo com ${totalPalavras} palavras — abaixo do mínimo de 1.500. Expandindo... (Claude)`, "warn");
        await pausa(2, "", log_);
        try {
          const expandido = await callGPT(PROMPTS.expansao(textoCompleto, totalPalavras), 6000);
          if (expandido?.length > 500) {
            const novaContagem = contarPalavras(expandido);
            textoFinal = expandido; setArtigo(expandido);
            log_(`✓ Expansão aplicada — ${novaContagem} palavras${novaContagem >= 1500 ? " ✓" : " (ainda abaixo de 1.500)"}`, novaContagem >= 1500 ? "ok" : "warn");
          } else {
            log_("⚠ Expansão retornou texto muito curto, mantendo original.", "warn");
          }
        } catch (e) {
          log_(`⚠ Expansão falhou (${e.message}). Continuando com versão atual.`, "warn");
        }
      }

      let auditFinal = null;

      setFase("polimento");
      log_("Polindo transição e voz ativa... (ChatGPT)");
      await pausa(2, "", log_);
      try {
        const polido = await callGPT(PROMPTS.polimento(textoCompleto), 6000);
        if (polido?.length > 500) {
          textoFinal = polido; setArtigo(polido);
          log_(`✓ Polimento aplicado — ${contarPalavras(polido)} palavras`, "ok");
        } else {
          log_("⚠ Polimento retornou texto muito curto, mantendo original.", "warn");
        }
      } catch (e) {
        log_(`⚠ Polimento falhou (${e.message}). Continuando.`, "warn");
      }

      // ── Fluxo de auditorias ───────────────────────────────────────────────
      // Rodada 1: Claude audita → Claude revisa → Claude fontes → Claude links
      // Rodada 2: Claude audita → Claude revisa
      const AUDITORES = { 1: "ChatGPT", 2: "ChatGPT" };

      for (let rodada = 1; rodada <= 2; rodada++) {
        const auditor = AUDITORES[rodada];

        setFase(`auditoria${rodada}`);
        log_(`Auditoria ${rodada}/2 — verificando qualidade, Yoast e linguagem... (${auditor})`);
        await pausa(2, "", log_);

        const rawA = await callGPT(PROMPTS.auditoria(textoFinal, rodada), 1500);

        const ad = parseJSON(rawA);
        if (!ad) { log_(`⚠ Auditoria ${rodada} não retornou JSON válido, pulando.`, "warn"); break; }
        auditFinal = ad;

        const yoastOk = !ad.yoast || (ad.yoast.status_transicao === "verde" && ad.yoast.status_passiva === "verde");
        const scoreSuficiente = ad.score_geral >= 90 && yoastOk;

        log_(
          `✓ Score rodada ${rodada}: ${ad.score_geral}/100` +
          (ad.yoast ? ` | Transição: ${ad.yoast.percentual_transicao}% (${ad.yoast.status_transicao}) | Passiva: ${ad.yoast.percentual_passiva}% (${ad.yoast.status_passiva})` : "") +
          (scoreSuficiente ? " — aprovado ✓" : " — revisando..."),
          scoreSuficiente ? "ok" : "warn"
        );

        const problemas = (ad.problemas || []).filter(p => p?.trim() && p.length > 5);
        if (scoreSuficiente && problemas.length === 0) { log_(`✓ Artigo aprovado na rodada ${rodada} (score ${ad.score_geral}/100)`, "ok"); break; }
        if (rodada === 2) { log_(`⚠ Score final ${ad.score_geral}/100 após 2 rodadas. Entregando melhor versão.`, "warn"); break; }

        setFase(`revisao${rodada}`);
        log_(`Revisão ${rodada}/2 — corrigindo ${problemas.length} problema(s)... (ChatGPT)`, "warn");
        problemas.forEach(p => log_(`  → ${p}`, "warn"));
        await pausa(2, "", log_);

        const revisado = await callGPT(PROMPTS.revisar(textoFinal, problemas), 6000);
        if (revisado?.length > 500) {
          textoFinal = revisado; setArtigo(revisado);
          log_(`✓ Revisão ${rodada} aplicada — ${contarPalavras(revisado)} palavras`, "ok");
        } else {
          log_(`⚠ Revisão ${rodada} retornou texto curto, mantendo versão anterior.`, "warn");
        }
      }

      // ── Fontes e links — sempre executados, independente do score ────────────
      setFase("fontes");
      log_("Buscando URLs de fontes oficiais... (ChatGPT)");
      await pausa(2, "", log_);
      try {
        const rawFontes = await callGPT(PROMPTS.buscarFontes(textoFinal), 600);
        const jsonFontes = parseJSON(rawFontes);
        if (jsonFontes?.fontes?.length > 0) {
          log_("✓ " + jsonFontes.fontes.length + " fonte(s) encontrada(s) — inserindo no artigo... (ChatGPT)", "ok");
          await pausa(2, "", log_);
          const comLinks = await callGPT(PROMPTS.inserirFontes(textoFinal, jsonFontes.fontes), 5000);
          const h1idx = comLinks.indexOf("#");
          const textoComFontes = h1idx > 0 ? comLinks.slice(h1idx).trim() : comLinks.trim();
          if (textoComFontes?.length > 500) {
            textoFinal = textoComFontes; setArtigo(textoComFontes);
            const qtdLinks = (textoComFontes.match(/\[.+?\]\(https?:\/\/.+?\)/g) || []).length;
            log_(`✓ ${qtdLinks} link(s) externo(s) inserido(s)`, "ok");
          } else { log_("⚠ Inserção de fontes retornou texto curto — mantendo versão anterior.", "warn"); }
        } else { log_("⚠ Nenhuma fonte encontrada — pulando etapa.", "warn"); }
      } catch (e) { log_(`⚠ Etapa de fontes falhou (${e.message}). Continuando.`, "warn"); }


      // ── Polimento Yoast final — garante transição ≥30% e passiva ≤10% ────
      setFase("polimento_final");
      log_("Polimento Yoast final — ajustando transição e voz passiva... (ChatGPT)");
      await pausa(2, "", log_);
      try {
        const polFinal = await callGPT(PROMPTS.polimento(textoFinal), 6000);
        if (polFinal?.length > 500) {
          textoFinal = polFinal; setArtigo(polFinal);
          log_("✓ Polimento final aplicado", "ok");
        } else { log_("⚠ Polimento final retornou texto curto — mantendo versão anterior.", "warn"); }
      } catch (e) { log_(`⚠ Polimento final falhou (${e.message}). Continuando.`, "warn"); }

      setAudit(auditFinal);
      setFase("pronto");

    } catch (err) {
      setErro(err.message || "Erro inesperado.");
      setFase("erro");
      log_(`✗ ${err.message}`, "erro");
    }
  }

  // Função de melhoria pós-entrega
  async function melhorar() {
    if (!artigo || melhorando) return;
    setMelhorando(true);
    setErro("");
    try {
      log_("── Iniciando melhoria pós-entrega ──────────────────", "ok");
      let textoAtual = artigo;

      setFase("auditoria1");
      log_("Auditoria de melhoria — identificando problemas... (Claude)");
      await pausa(2, "", log_);
      const rawA = await callGPT(PROMPTS.auditoria(textoAtual, 1), 1500);
      const ad = parseJSON(rawA);
      if (!ad) { log_("⚠ Auditoria não retornou JSON válido.", "warn"); setMelhorando(false); setFase("pronto"); return; }
      setAudit(ad);

      const yoastOk = !ad.yoast || (ad.yoast.status_transicao === "verde" && ad.yoast.status_passiva === "verde");
      const scoreSuficiente = ad.score_geral >= 90 && yoastOk;
      log_(`✓ Score: ${ad.score_geral}/100${scoreSuficiente ? " — já está 90+!" : " — aplicando correções..."}`, scoreSuficiente ? "ok" : "warn");

      if (!scoreSuficiente) {
        const problemas = (ad.problemas || []).filter(p => p?.trim() && p.length > 5);
        setFase("revisao1");
        log_(`Revisão de melhoria — corrigindo ${problemas.length} problema(s)... (Claude)`, "warn");
        problemas.forEach(p => log_(`  → ${p}`, "warn"));
        await pausa(2, "", log_);
        const revisado = await callGPT(PROMPTS.revisar(textoAtual, problemas), 6000);
        if (revisado?.length > 500) { textoAtual = revisado; setArtigo(revisado); log_(`✓ Revisão aplicada — ${contarPalavras(revisado)} palavras`, "ok"); }

        setFase("polimento_final");
        log_("Polimento Yoast final... (Claude)");
        await pausa(2, "", log_);
        const polFinal = await callGPT(PROMPTS.polimento(textoAtual), 6000);
        if (polFinal?.length > 500) { textoAtual = polFinal; setArtigo(polFinal); log_("✓ Polimento aplicado", "ok"); }
      }

      setFase("pronto");
      log_("✓ Melhoria concluída!", "ok");
    } catch (e) {
      setErro(e.message || "Erro na melhoria.");
      setFase("pronto");
      log_(`✗ ${e.message}`, "erro");
    } finally {
      setMelhorando(false);
    }
  }

  const busy = !["idle", "pronto", "erro"].includes(fase);
  const faseIdx = FASES.findIndex(f => f.id === fase);

  return (
    <div style={{ minHeight: "100vh", background: BRAND.bg, fontFamily: BRAND.font, display: "flex", flexDirection: "column", alignItems: "center", padding: "40px 20px" }}>

      {/* ── Google Fonts: Inter ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        @keyframes spin { to { transform: rotate(360deg) } }
        * { box-sizing: border-box; }
        input::placeholder { color: #BDBDBD; }
        input:focus { outline: none; border-color: ${BRAND.primary} !important; box-shadow: 0 0 0 3px ${BRAND.primaryLight}; }
        button:hover:not(:disabled) { opacity: 0.88; }
      `}</style>

      {/* ── Header ── */}
      <div style={{ width: "100%", maxWidth: "760px", marginBottom: "24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          {/* Logo Sittax SVG */}
          <svg style={{ height: "28px", width: "auto", flexShrink: 0 }} viewBox="0 0 3443.74 859.87" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink">
            <defs>
              <clipPath id="cp0"><rect x="0" y="0" width="3443.74" height="859.87" /></clipPath>
              <clipPath id="cp1"><rect x="0" y="0" width="3443.74" height="859.87" /></clipPath>
            </defs>
            <g clipPath="url(#cp0)">
              <g clipPath="url(#cp1)">
                <path fill="#3b3a3e" fillRule="evenodd" d="M1813.19,318.49c0-63.26-50.88-115.05-113.53-114.95l-266.02.46v56.78l235.52-.44c56.77-.12,83.87,28.29,83.87,85.57v35.75c-20.3-19.04-47.6-30.69-77.63-30.69h-128.24c-62.7,0-113.53,50.83-113.53,113.52v76.25c0,62.7,50.83,113.53,113.53,113.53h128.24c30.03,0,57.33-11.67,77.63-30.71v30.71h60.15v-335.77ZM1659.32,408.57c38.12,0,68.62,30.5,68.62,68.63v50.83c0,38.12-30.5,68.63-68.62,68.63h-96.06c-38.12,0-68.62-30.51-68.62-68.63v-50.83c0-38.13,30.5-68.63,68.62-68.63h96.06Z" />
                <path fill="#3b3a3e" fillRule="evenodd" d="M1367.74,596.66h-92.35c-49.98,0-80.48-38.13-80.48-86.55v-249.79h172.83v-56.76h-172.83v-89.64h-61v89.64h-71.17v56.76h71.17v280.29c0,62.83,50.83,113.67,113.53,113.67h120.3v-57.62Z" />
                <path fill="#3b3a3e" fillRule="evenodd" d="M996.84,596.66h-92.34c-49.99,0-80.49-38.13-80.49-86.55v-249.79h172.83v-56.76h-172.83v-89.64h-61v89.64h-71.17v56.76h71.17v280.29c0,62.84,50.84,113.67,113.53,113.67h120.3v-57.62Z" />
                <rect fill="#3b3a3e" x="564.94" y="203.55" width="61" height="450.72" />
                <path fill="#3b3a3e" fillRule="evenodd" d="M385.51,654.27c62.69.13,113.53-50.84,113.53-114.37v-27.12c-.86-61-49.99-110.13-110.15-110.13h-129.62c-50.84,0-77.1-20.47-77.1-62.27,0-5.93.12-14.41,0-20.47-.73-37.42,33.88-59.59,83.03-59.59h233.83v-56.76H238.09c-60.14,0-116.91,44.9-116.91,103.64v40.1c0,60.44,48.29,107.03,108.44,107.03h110.98c71.17,0,97.44,26.27,98.29,66.08v3.39c0,44.05-27.96,73-83.03,72.86L0,595.78v57.6l385.52.88Z" />
                <path fill="#3b3a3e" fillRule="evenodd" d="M2222.79,376.69l155.24-172.35h-94.27l-107.96,119.94,46.99,52.41ZM2128.62,480.92l-155.13,172.47h-94.38l202.33-224.53-202.33-224.52h94.38c134.78,149.8,269.77,299.37,404.65,449.05h-94.37l-155.15-172.47Z" />
                <path fill="#f26524" fillRule="evenodd" d="M3280,732.48c-156.82-119.51-375.57-119.51-532.4,0l127.38,127.38c84.68-52.86,192.94-52.86,277.62,0l127.39-127.38Z" />
                <path fill="#f26524" fillRule="evenodd" d="M2711.25,696.14c119.51-156.82,119.52-375.57.01-532.4l-127.39,127.39c52.86,84.68,52.87,192.95.01,277.64l127.37,127.37Z" />
                <path fill="#f26524" fillRule="evenodd" d="M2747.62,127.39c156.82,119.51,375.56,119.51,532.38-.01L3152.64,0c-84.68,52.87-192.94,52.86-277.62-.01l-127.39,127.39Z" />
                <path fill="#f26524" fillRule="evenodd" d="M3316.36,163.74c-119.51,156.82-119.52,375.57-.01,532.4l127.39-127.39c-52.86-84.68-52.87-192.95-.01-277.64l-127.37-127.37Z" />
              </g>
            </g>
          </svg>
          <div style={{ width: "1px", height: "28px", background: BRAND.border }} />
          <div>
            <div style={{ fontSize: "15px", fontWeight: "600", color: BRAND.text, letterSpacing: "-0.2px", lineHeight: 1.2 }}>Gerador de Artigos</div>
            <div style={{ fontSize: "11px", color: BRAND.textMuted, fontWeight: "400" }}>Inteligência Tributária</div>
          </div>
        </div>
        <div style={{ fontSize: "11px", color: BRAND.textLight, fontWeight: "500", background: "#F0F0F0", padding: "4px 10px", borderRadius: "20px" }}>
          Pesquisa · Corpo · FAQ · Auditoria · PDF
        </div>
      </div>

      {/* ── Card principal ── */}
      <div style={{ width: "100%", maxWidth: "760px", background: BRAND.card, borderRadius: BRAND.radiusLg, border: `1px solid ${BRAND.border}`, boxShadow: "0 1px 6px rgba(0,0,0,0.07)", overflow: "hidden" }}>

        {/* Input */}
        <div style={{ padding: "24px 28px", borderBottom: `1px solid ${BRAND.border}` }}>

          {/* Linha do tema + botão */}
          <label style={{ display: "block", fontSize: "11px", fontWeight: "600", color: BRAND.textMuted, marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Tema do artigo
          </label>
          <div style={{ display: "flex", gap: "10px" }}>
            <input
              value={tema}
              onChange={e => setTema(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !busy && gerar()}
              placeholder="Ex: Simples Nacional após a Reforma Tributária — o que muda para MEIs"
              disabled={busy}
              style={{
                flex: 1, padding: "11px 14px",
                borderRadius: BRAND.radius,
                border: `1.5px solid ${BRAND.border}`,
                fontSize: "14px", color: BRAND.text,
                background: busy ? "#F7F7F7" : "#fff",
                transition: "border-color 0.15s, box-shadow 0.15s",
                fontFamily: BRAND.font,
              }}
            />
            <button
              onClick={gerar}
              disabled={busy || !tema.trim()}
              style={{
                padding: "11px 22px",
                borderRadius: BRAND.radius,
                border: "none",
                background: busy || !tema.trim() ? "#E0E0E0" : BRAND.primary,
                color: busy || !tema.trim() ? "#ABABAB" : "#fff",
                fontSize: "14px", fontWeight: "600",
                cursor: busy || !tema.trim() ? "not-allowed" : "pointer",
                whiteSpace: "nowrap", fontFamily: BRAND.font,
                boxShadow: busy || !tema.trim() ? "none" : `0 2px 8px rgba(242,107,55,0.3)`,
                transition: "background 0.15s, box-shadow 0.15s",
              }}
            >
              {busy ? "Gerando…" : "Gerar artigo →"}
            </button>
          </div>
          <p style={{ margin: "8px 0 0", fontSize: "12px", color: BRAND.textLight }}>
            O processo leva ~3 minutos. Inclui pesquisa em portais tributários, auditoria e polimento Yoast.
          </p>
        </div>

        {/* Progress bar */}
        {!["idle", "erro"].includes(fase) && (
          <div style={{ padding: "16px 28px", borderBottom: `1px solid ${BRAND.border}`, background: "#FAFAFA" }}>
            <div style={{ display: "flex", alignItems: "center" }}>
              {FASES.map((f, i) => {
                const done = fase === "pronto" || faseIdx > i;
                const active = faseIdx === i && fase !== "pronto";
                return (
                  <div key={f.id} style={{ display: "flex", alignItems: "center", flex: i < FASES.length - 1 ? 1 : undefined }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                      <div style={{
                        width: "24px", height: "24px",
                        borderRadius: "50%",
                        background: done ? BRAND.primary : active ? BRAND.primaryLight : "#EBEBEB",
                        border: active ? `2px solid ${BRAND.primary}` : "2px solid transparent",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "9px", fontWeight: "700",
                        color: done ? "#fff" : active ? BRAND.primary : "#ABABAB",
                        transition: "background 0.2s",
                      }}>
                        {done ? "✓" : active ? f.icon : i + 1}
                      </div>
                      <span style={{ fontSize: "8px", color: done || active ? BRAND.text : "#BDBDBD", whiteSpace: "nowrap", fontWeight: active ? "600" : "400" }}>
                        {f.label}
                      </span>
                    </div>
                    {i < FASES.length - 1 && (
                      <div style={{ flex: 1, height: "2px", margin: "0 2px", marginBottom: "16px", background: done ? BRAND.primary : "#E8E8E8", transition: "background 0.3s" }} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Log */}
        {log.length > 0 && (
          <div ref={logRef} style={{ padding: "14px 28px", borderBottom: fase === "pronto" || audit ? `1px solid ${BRAND.border}` : undefined, maxHeight: "180px", overflowY: "auto", background: "#FAFAFA" }}>
            {log.map((l, i) => (
              <div key={i} style={{
                fontSize: "12.5px", padding: "2px 0", display: "flex", gap: "10px",
                color: l.tipo === "ok" ? BRAND.success : l.tipo === "warn" ? BRAND.warn : l.tipo === "erro" ? BRAND.error : BRAND.textMuted
              }}>
                <span style={{ color: BRAND.textLight, fontFamily: "monospace", fontSize: "10.5px", flexShrink: 0 }}>{l.ts}</span>
                <span>{l.msg}</span>
              </div>
            ))}
            {busy && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "6px" }}>
                <div style={{ width: "12px", height: "12px", borderRadius: "50%", border: `2px solid ${BRAND.primary}`, borderTopColor: "transparent", animation: "spin 0.8s linear infinite" }} />
                <span style={{ fontSize: "12.5px", color: BRAND.primary, fontWeight: "600" }}>
                  {FASES[faseIdx]?.icon} {FASES[faseIdx]?.label}…
                </span>
              </div>
            )}
          </div>
        )}

        {/* Auditoria final */}
        {audit && fase === "pronto" && (
          <div style={{ padding: "20px 28px", borderBottom: `1px solid ${BRAND.border}` }}>
            <div style={{ display: "flex", gap: "14px", marginBottom: "12px" }}>
              {/* Score */}
              <div style={{
                padding: "14px 20px", borderRadius: BRAND.radiusMd, textAlign: "center",
                background: audit.score_geral >= 90 ? BRAND.successBg : audit.score_geral >= 80 ? BRAND.warnBg : BRAND.errorBg,
                border: `1px solid ${audit.score_geral >= 90 ? BRAND.successBorder : audit.score_geral >= 80 ? BRAND.warnBorder : BRAND.errorBorder}`,
                minWidth: "80px",
              }}>
                <div style={{ fontSize: "30px", fontWeight: "800", lineHeight: 1, color: audit.score_geral >= 90 ? BRAND.success : audit.score_geral >= 80 ? BRAND.warn : BRAND.error }}>
                  {audit.score_geral}
                </div>
                <div style={{ fontSize: "9px", color: BRAND.textMuted, fontWeight: "700", marginTop: "4px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Score</div>
              </div>
              {/* Checklist */}
              <div style={{ flex: 1 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3px 12px", marginBottom: "10px" }}>
                  {Object.entries(audit.checklist || {}).map(([k, v]) => (
                    <div key={k} style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "11px" }}>
                      <span style={{ color: v ? "#22C55E" : "#EF4444", fontWeight: "700" }}>{v ? "✓" : "✗"}</span>
                      <span style={{ color: v ? BRAND.text : BRAND.textLight }}>{k.replace(/_/g, " ")}</span>
                    </div>
                  ))}
                </div>
                <div style={{
                  display: "inline-block", padding: "3px 10px",
                  borderRadius: "20px", fontSize: "11px", fontWeight: "700",
                  background: audit.aprovado ? BRAND.successBg : BRAND.errorBg,
                  color: audit.aprovado ? BRAND.success : BRAND.error,
                  border: `1px solid ${audit.aprovado ? BRAND.successBorder : BRAND.errorBorder}`,
                }}>
                  {audit.aprovado ? "✓ Aprovado" : "⚠ Melhorias aplicadas"}
                </div>
              </div>
            </div>

            {/* Yoast */}
            {audit.yoast && (
              <div style={{ display: "flex", gap: "10px", marginBottom: "12px" }}>
                <div style={{
                  flex: 1, padding: "10px 14px", borderRadius: BRAND.radiusMd, border: `1px solid ${BRAND.border}`,
                  background: audit.yoast.status_transicao === "verde" ? BRAND.successBg : audit.yoast.status_transicao === "laranja" ? BRAND.warnBg : BRAND.errorBg
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                    <div style={{
                      width: "8px", height: "8px", borderRadius: "50%",
                      background: audit.yoast.status_transicao === "verde" ? "#22C55E" : audit.yoast.status_transicao === "laranja" ? "#F59E0B" : "#EF4444"
                    }} />
                    <span style={{ fontSize: "11px", fontWeight: "700", color: BRAND.text }}>Palavras de transição</span>
                  </div>
                  <div style={{ fontSize: "20px", fontWeight: "800", color: BRAND.text }}>{audit.yoast.percentual_transicao}%</div>
                  <div style={{ fontSize: "10px", color: BRAND.textMuted }}>meta: ≥ 30% · {audit.yoast.frases_com_transicao}/{audit.yoast.total_frases} frases</div>
                </div>
                <div style={{
                  flex: 1, padding: "10px 14px", borderRadius: BRAND.radiusMd, border: `1px solid ${BRAND.border}`,
                  background: audit.yoast.status_passiva === "verde" ? BRAND.successBg : BRAND.errorBg
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                    <div style={{
                      width: "8px", height: "8px", borderRadius: "50%",
                      background: audit.yoast.status_passiva === "verde" ? "#22C55E" : "#EF4444"
                    }} />
                    <span style={{ fontSize: "11px", fontWeight: "700", color: BRAND.text }}>Voz passiva</span>
                  </div>
                  <div style={{ fontSize: "20px", fontWeight: "800", color: BRAND.text }}>{audit.yoast.percentual_passiva}%</div>
                  <div style={{ fontSize: "10px", color: BRAND.textMuted }}>meta: ≤ 10% · {audit.yoast.frases_passivas}/{audit.yoast.total_frases} frases</div>
                </div>
              </div>
            )}

            {audit.resumo && (
              <p style={{ margin: 0, fontSize: "13px", color: BRAND.text, background: "#F7F7F7", borderRadius: BRAND.radius, padding: "12px 16px", borderLeft: `3px solid ${BRAND.primary}` }}>
                {audit.resumo}
              </p>
            )}
          </div>
        )}

        {/* Metadados */}
        {pesquisa && fase === "pronto" && (
          <div style={{ padding: "16px 28px", borderBottom: `1px solid ${BRAND.border}` }}>
            <p style={{ margin: "0 0 8px", fontSize: "10px", fontWeight: "700", color: BRAND.textMuted, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Metadados para o WordPress
            </p>
            {[["Keyword primária", pesquisa.keyword_primaria], ["Meta Title", pesquisa.meta_title], ["Meta Description", pesquisa.meta_description], ["Slug", pesquisa.slug]].map(([l, v]) => v ? (
              <div key={l} style={{ marginBottom: "5px", fontSize: "13px" }}>
                <span style={{ color: BRAND.textLight }}>{l}: </span>
                <span style={{ color: BRAND.text, fontWeight: "500" }}>{v}</span>
              </div>
            ) : null)}
          </div>
        )}

        {/* Botões de ação */}
        {fase === "pronto" && artigo && (
          <>
            <div style={{ padding: "20px 28px 14px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <button
                onClick={() => baixarHtml(artigo, pesquisa)}
                style={{
                  display: "inline-flex", alignItems: "center", gap: "8px",
                  padding: "12px 24px", borderRadius: BRAND.radius, border: "none",
                  background: BRAND.primary, color: "#fff",
                  fontSize: "14px", fontWeight: "600", cursor: "pointer",
                  boxShadow: `0 2px 10px rgba(242,107,55,0.35)`,
                  fontFamily: BRAND.font,
                }}
              >
                ⬇ Baixar arquivo para PDF
              </button>
              {audit && audit.score_geral < 90 && !melhorando && (
                <button
                  onClick={melhorar}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: "8px",
                    padding: "12px 24px", borderRadius: BRAND.radius, border: "none",
                    background: "#F59E0B", color: "#fff",
                    fontSize: "14px", fontWeight: "600", cursor: "pointer",
                    boxShadow: "0 2px 10px rgba(245,158,11,0.35)",
                    fontFamily: BRAND.font,
                  }}
                >
                  ⚡ Melhorar para 90+
                </button>
              )}
              {melhorando && (
                <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "12px 20px", background: "#FEF3C7", borderRadius: BRAND.radius, fontSize: "13px", color: "#92400E", fontWeight: "500" }}>
                  ⏳ Melhorando artigo...
                </div>
              )}
              <button
                onClick={() => { setFase("idle"); setTema(""); setLog([]); setPesquisa(null); setArtigo(""); setAudit(null); setMelhorando(false); }}
                style={{
                  padding: "12px 20px", borderRadius: BRAND.radius,
                  border: `1.5px solid ${BRAND.border}`,
                  background: "#fff", color: BRAND.text,
                  fontSize: "14px", cursor: "pointer", fontFamily: BRAND.font, fontWeight: "500",
                }}
              >
                Novo artigo
              </button>
            </div>
            <div style={{ margin: "0 28px 20px", padding: "11px 14px", background: BRAND.warnBg, border: `1px solid ${BRAND.warnBorder}`, borderRadius: BRAND.radius, fontSize: "12px", color: BRAND.warn, lineHeight: "1.7" }}>
              <strong>Como converter para PDF:</strong> baixe o arquivo → abra no navegador → <strong>Ctrl+P</strong> → destino <strong>"Salvar como PDF"</strong> → Salvar.
            </div>
          </>
        )}

        {/* Erro */}
        {fase === "erro" && (
          <div style={{ padding: "18px 28px", background: BRAND.errorBg, borderTop: `1px solid ${BRAND.errorBorder}` }}>
            <p style={{ margin: "0 0 12px", color: BRAND.error, fontSize: "13px" }}>⚠ {erro}</p>
            <button
              onClick={() => { setFase("idle"); setLog([]); }}
              style={{ padding: "8px 16px", borderRadius: BRAND.radius, border: `1px solid ${BRAND.errorBorder}`, background: "#fff", color: BRAND.error, fontSize: "13px", cursor: "pointer", fontFamily: BRAND.font }}
            >
              Tentar novamente
            </button>
          </div>
        )}
      </div>

      {/* Dica inferior */}
      {fase === "idle" && (
        <div style={{ marginTop: "14px", maxWidth: "760px", width: "100%", padding: "13px 18px", borderRadius: BRAND.radius, background: "#F5F5F5", border: "1px solid #E4E4E4", fontSize: "13px", color: BRAND.textMuted, lineHeight: "1.65" }}>
          <strong>Como usar:</strong> Digite o tema e clique em "Gerar artigo". O processo leva ~3 minutos — inclui polimento Yoast (transição + voz ativa) e <strong>2 rodadas de auditoria/revisão</strong> para score ≥ 90. Depois baixe e converta para PDF com Ctrl+P.
        </div>
      )}

      {/* Assinatura */}
      <div style={{ width: "100%", maxWidth: "760px", marginTop: "20px", display: "flex", justifyContent: "flex-end" }}>
        <span style={{ fontSize: "11px", color: BRAND.textLight, fontWeight: "400", letterSpacing: "0.01em" }}>
          Powered by{" "}
          <span style={{ fontWeight: "600", color: BRAND.textMuted }}>Victor Lisita MKT</span>
        </span>
      </div>

    </div>
  );
}
