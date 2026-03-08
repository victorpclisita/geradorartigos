import { useState, useRef, useEffect } from "react";

// ─── PROMPTS ──────────────────────────────────────────────────────────────────

const PROMPTS = {

  // ─── PESQUISA ─────────────────────────────────────────────────────────────────
  // Retorna JSON com estrutura do artigo, keywords, dado recente e FAQ
  pesquisa: (tema) => `Você é especialista em SEO e conteúdo tributário fiscal brasileiro.

TEMA: "${tema}"

Sua tarefa: planejar a estrutura de um artigo de blog sobre esse tema.

PASSO 1 — Busque na internet 1 dado concreto de 2025 ou 2026 sobre o tema (estatística, notícia, decreto, dado de órgão oficial). Use web_search. Anote o fato exato e a URL real encontrada.

PASSO 2 — Preencha o JSON abaixo com as informações do planejamento.

REGRAS DO JSON:
- "intencao_busca": sempre "Informacional + Estratégia"
- "secoes": entre 3 e 5 seções H2. Pelo menos 1 deve ter H3s sugeridos; pelo menos 1 deve ficar sem H3 (para receber lista de bullet points)
- "faq_perguntas": exatamente 4 perguntas reais que um contador ou empresário faria
- "fontes_primarias": leis ou normas reais relacionadas ao tema (ex: "LC 123/2006")
- "dado_recente.url": URL real encontrada no PASSO 1 — NUNCA invente

Responda SOMENTE com o JSON abaixo. Nenhum texto antes ou depois. Nenhum bloco de código.

{
  "keyword_primaria": "keyword estratégica de 1-4 palavras",
  "keywords_secundarias": ["lsi 1", "lsi 2", "lsi 3", "lsi 4", "lsi 5", "lsi 6"],
  "intencao_busca": "Informacional + Estratégia",
  "angulo_diferenciado": "ângulo que diferencia este artigo de resultados genéricos do Google",
  "dado_recente": {
    "fato": "dado concreto de 2025/2026 encontrado na busca",
    "fonte": "Nome do órgão ou portal",
    "url": "https://url-real-encontrada.com.br"
  },
  "secoes": [
    { "h2": "Título da seção 1", "h3s": ["subtópico a", "subtópico b"], "foco": "o que abordar nesta seção" },
    { "h2": "Título da seção 2", "h3s": [], "foco": "seção sem H3 — receberá lista de bullet points" },
    { "h2": "Título da seção 3", "h3s": [], "foco": "o que abordar nesta seção" }
  ],
  "faq_perguntas": ["Pergunta 1?", "Pergunta 2?", "Pergunta 3?", "Pergunta 4?"],
  "meta_title": "title tag até 60 caracteres com keyword",
  "meta_description": "meta description até 155 caracteres respondendo a intenção de busca",
  "slug": "slug-com-keyword-principal",
  "fontes_primarias": ["Lei ou norma real 1", "Lei ou norma real 2"]
}`,

  // ─── CORPO ────────────────────────────────────────────────────────────────────
  // Parte 1 do artigo: título H1 + introdução + seções H2/H3
  // NÃO inclui FAQ, conclusão nem CTA — gerados separadamente
  corpo: (tema, p) => `Você é consultor tributário sênior escrevendo um artigo de blog para outros contadores e gestores contábeis.

O leitor É profissional do setor. Não explique o que é Simples Nacional, DAS, PGDAS, MEI, CNPJ ou qualquer conceito básico de contabilidade. Vá direto às implicações práticas.

TEMA: "${tema}"
KEYWORD PRIMÁRIA: "${p.keyword_primaria}"
KEYWORDS SECUNDÁRIAS: ${p.keywords_secundarias.join(", ")}
ÂNGULO DO ARTIGO: ${p.angulo_diferenciado}
DADO RECENTE PARA INSERIR: "${p.dado_recente?.fato}" — Fonte: ${p.dado_recente?.fonte} — URL: ${p.dado_recente?.url}

SEÇÕES A ESCREVER:
${p.secoes.map((s, i) => (i + 1) + ". H2: \"" + s.h2 + "\"\n   Foco: " + s.foco + (s.h3s.length ? "\n   H3s sugeridos: " + s.h3s.join(", ") : "\n   → Esta seção NÃO tem H3. Use lista de bullet points (\"-\") aqui.")).join("\n")}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
O QUE ESCREVER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Escreva: título H1 + introdução + as seções H2 listadas acima.
NÃO escreva: FAQ, Conclusão ou CTA — esses serão gerados separadamente.
Mínimo obrigatório: 1.100 palavras nesta parte.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
INTRODUÇÃO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- 2 a 3 parágrafos (não mais, não menos)
- 1º parágrafo: começa com dado concreto ou número real + impacto prático direto
- 2º parágrafo: contexto — o que está mudando, o que está em jogo
- 3º parágrafo (opcional): o que o leitor vai encontrar no artigo
- A keyword primária aparece no 1º ou 2º parágrafo, de forma natural
- PROIBIDO: histórias fictícias, personagens inventados, "Imagine que...", "Você sabia que..."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ESTRUTURA DE CADA SEÇÃO H2
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
REGRA 1 — PARÁGRAFO ANTES DE H3 (obrigatório):
Sempre que uma seção H2 tiver H3s, deve haver ao menos 1 parágrafo de texto corrido ANTES do primeiro H3.
Estrutura correta:
  ## Título H2
  [parágrafo introdutório]
  ### Subtítulo H3
  [conteúdo]
Estrutura PROIBIDA:
  ## Título H2
  ### Subtítulo H3  ← ERRO: H3 logo após H2 sem parágrafo

REGRA 2 — LISTA DE BULLET POINTS (obrigatório em ao menos 1 seção):
Nas seções marcadas como "sem H3", use lista de bullet points com "-".
Estrutura correta:
  ## Título H2
  [parágrafo introdutório]
  - Item 1: ação ou informação concreta
  - Item 2: ação ou informação concreta
  - Item 3: ação ou informação concreta
  [parágrafo após a lista, opcional]
Regras da lista: mínimo 3 itens; cada item com 1 a 2 linhas; começa com "- ".
PROIBIDO: abrir lista logo após o título H2 sem parágrafo antes.

REGRA 3 — LIMITE DE 300 PALAVRAS POR SEÇÃO H2:
Conte as palavras do texto corrido entre dois headings consecutivos (exclua o texto do título H2).
Se a seção atingir 270 palavras e ainda houver conteúdo, abra um H3 ou um novo H2 e continue lá.
NUNCA corte conteúdo — apenas redistribua em subdivisões.

REGRA 4 — PELO MENOS 1 SEÇÃO COM H3s:
O artigo inteiro deve ter ao menos 1 seção H2 com H3s. Não pode ter zero H3s no total.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAMANHO DOS PARÁGRAFOS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Cada parágrafo de texto corrido deve ter entre 20 e 55 palavras.
Antes de fechar cada parágrafo, conte as palavras. Se passar de 55, quebre em dois.
Nunca escreva dois parágrafos acima de 40 palavras em sequência — intercale com um parágrafo curto (15 a 25 palavras).
Esta regra se aplica APENAS ao texto corrido. Bullet points e títulos estão isentos.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
HIPERLINKS E FONTES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- O DADO RECENTE deve aparecer no artigo com hiperlink markdown: [texto âncora](url)
- Toda citação a um órgão, lei ou pesquisa com URL disponível DEVE ter link. Exemplo: [Receita Federal](https://gov.br/receitafederal)
- Se não tiver a URL real, reescreva sem atribuição: use "conforme a legislação vigente" em vez de "segundo a Receita Federal"
- PROIBIDO citar órgão ou lei sem link quando você não tem a URL real

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LEGISLAÇÃO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Cite número de lei SOMENTE se tiver certeza absoluta de que ela existe.
Leis seguras para citar com número: LC 123/2006, LC 116/2003, CTN, CF/1988.
Para qualquer outra lei, omita o número e use: "conforme a legislação tributária vigente".
PROIBIDO ABSOLUTO: inventar número de lei, instrução normativa ou resolução.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PALAVRAS PROIBIDAS (linguagem de IA)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
O artigo será reprovado se qualquer uma dessas aparecer:
Adjetivos vagos: robusto, abrangente, transformador, dinâmico, holístico, multifacetado, inovador, disruptivo
Expressões de enrolação: "No cenário atual", "É crucial", "Vale ressaltar", "Vale destacar", "Neste contexto", "Em suma", "Mais do que nunca", "É importante destacar", "É fundamental", "Cabe destacar", "Diante disso", "Não se trata apenas de"
Verbos corporativos: alavancar, delinear, impulsionar, potencializar, mergulhar (metafórico), navegar (metafórico)
Outros: Sinergias, Paradigma, Ecossistema (fora de contexto técnico real)
Teste: se a frase parece de relatório corporativo genérico, reescreva como um contador falaria para um cliente.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
VOZ ATIVA E TRANSIÇÃO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Máximo 10% das frases na voz passiva. Prefira sempre o sujeito ativo.
  ERRADO: "o imposto é calculado pela Receita" | CERTO: "a Receita calcula o imposto"
- Pelo menos 30% das frases devem ter uma palavra de transição, em posição variada (início, meio ou fim).
  Use: portanto, assim, além disso, no entanto, por isso, dessa forma, ou seja, inclusive, conforme, já que, bem como, contudo, todavia, pois, logo, de fato, em razão disso, nesse sentido

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FORMATO DE SAÍDA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# [Título H1 com keyword primária]

[Parágrafo 1 da introdução]

[Parágrafo 2 da introdução]

## [Seção H2 — com H3s]

[Parágrafo introdutório obrigatório]

### [H3]

[conteúdo]

## [Seção H2 — com bullet points]

[Parágrafo introdutório obrigatório]

- Item 1
- Item 2
- Item 3

## [Seção H2 — livre]

[conteúdo]`,

  // ─── FAQ ──────────────────────────────────────────────────────────────────────
  // Parte 2: exatamente 4 perguntas e respostas
  faq: (tema, p, corpo) => `Você é especialista tributário da Sittax, consultoria contábil brasileira.

CONTEXTO: artigo sobre "${tema}" (keyword: "${p.keyword_primaria}")
Início do artigo já escrito: ${corpo.slice(0, 300)}...

Escreva SOMENTE a seção de FAQ com as 4 perguntas abaixo. Nada antes ou depois.

PERGUNTAS:
${p.faq_perguntas.map((q, i) => (i + 1) + ". " + q).join("\n")}

REGRAS:
- Cada resposta começa diretamente com a resposta — sem introdução, sem "Boa pergunta"
- 3 a 4 frases por resposta, diretas e objetivas
- Tom: contador respondendo pessoalmente a um cliente — sem enrolação
- Use dados concretos quando aplicável (prazos, alíquotas, valores)
- NUNCA cite número de lei sem certeza — use "conforme a legislação vigente"
- PROIBIDO: "É importante ressaltar", "Vale destacar", "É fundamental", "Neste contexto", "Cabe destacar"
- Mínimo 350 palavras no total da seção

FORMATO DE SAÍDA:
## Perguntas Frequentes

### [Pergunta 1 exata]

[Resposta direta, 3-4 frases]

### [Pergunta 2 exata]

[Resposta direta, 3-4 frases]

### [Pergunta 3 exata]

[Resposta direta, 3-4 frases]

### [Pergunta 4 exata]

[Resposta direta, 3-4 frases]`,

  // ─── CONCLUSÃO ────────────────────────────────────────────────────────────────
  conclusao: (tema, p) => `Você é especialista tributário da Sittax.

Escreva SOMENTE a seção de conclusão de um artigo sobre "${tema}". Nada antes ou depois.

ESTRUTURA OBRIGATÓRIA:
- Título: ## Conclusão
- 2 a 3 parágrafos curtos (20 a 50 palavras cada)
- 1º parágrafo: o que o leitor aprendeu — em termos práticos, sem academicismo
- 2º parágrafo: o que muda na prática para o empresário ou contador a partir de agora
- 3º parágrafo (opcional): passo concreto que o leitor pode dar hoje

TOM: como encerrar uma reunião de consultoria — direto, útil, sem discurso.

PROIBIDO: "Em suma", "Por fim", "Concluindo", "Em conclusão", "É crucial", "Vale ressaltar", "Neste contexto", "Transforme"

Mínimo 150 palavras.

FORMATO DE SAÍDA:
## Conclusão

[Parágrafo 1]

[Parágrafo 2]`,

  // ─── CTA ──────────────────────────────────────────────────────────────────────
  cta: (tema, p) => `Você é especialista tributário da Sittax.

Escreva SOMENTE um parágrafo de CTA para um artigo sobre "${tema}". Nada antes ou depois. Sem título.

REGRAS:
- 2 a 3 frases
- Começa com uma frase sobre o impacto prático do tema para o leitor
- Convida o leitor a falar com a Sittax para analisar o caso específico da empresa dele
- Tom consultivo e direto — não promocional
- PROIBIDO: "Em suma", "Por fim", "Concluindo", "Portanto", "Transforme", "É crucial"`,

  // ─── EXPANSÃO ─────────────────────────────────────────────────────────────────
  // Acionada apenas quando o artigo tem menos de 1.500 palavras após montagem
  expansao: (textoCompleto, palavrasAtuais) => `Você é redator especialista da Sittax.

O artigo abaixo tem ${palavrasAtuais} palavras. O mínimo obrigatório é 1.500 palavras.
Faltam aproximadamente ${1500 - palavrasAtuais} palavras.

SUA TAREFA: expandir o artigo até atingir pelo menos 1.500 palavras.

COMO EXPANDIR (escolha o que fizer mais sentido):
- Aprofunde seções H2 existentes com mais detalhes práticos, exemplos reais ou dados numéricos
- Expanda respostas do FAQ com mais contexto e orientações práticas
- Adicione alíquotas, prazos ou valores onde faltarem

PROIBIDO:
- Criar novas seções H2 fora da estrutura atual
- Repetir informações já presentes
- Usar linguagem de IA: "robusto", "é crucial", "vale ressaltar", "abrangente", "alavancar"
- Alterar ou remover links markdown existentes
- Inventar dados, leis ou URLs

Retorne o artigo completo expandido, com todos os títulos # ## ###.

ARTIGO ATUAL:
${textoCompleto}`,

  // ─── POLIMENTO ────────────────────────────────────────────────────────────────
  // Corrige transição, voz passiva, tamanho de parágrafo e estrutura H2→H3
  // Executado ANTES das auditorias
  polimento: (textoCompleto) => `Você é revisor especialista em legibilidade de textos em português brasileiro.

Revise o artigo abaixo aplicando as 4 correções abaixo. Não altere mais nada além do que cada correção pede.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CORREÇÃO 1 — PALAVRAS DE TRANSIÇÃO (meta: ≥ 30% das frases)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Separe todas as frases do artigo (por "." "!" "?"). Ignore títulos H1/H2/H3, itens de lista e URLs.
2. Conte quantas frases têm pelo menos uma palavra de transição da lista abaixo.
3. Se o percentual for menor que 30%, insira transições nas frases que estiverem mais "soltas".
4. Varie a posição: início ("Além disso, a empresa..."), meio ("A empresa, portanto, deve..."), fim ("...o que reduz a multa, inclusive.")
5. A inserção deve soar natural — nunca mecânica ou forçada.

Palavras válidas: portanto, assim, além disso, no entanto, por isso, dessa forma, ou seja, ainda assim, conforme, por outro lado, já que, uma vez que, bem como, em seguida, por exemplo, contudo, todavia, inclusive, pois, logo, apesar disso, de fato, ao mesmo tempo, anteriormente, posteriormente, sobretudo, certamente, então, entretanto, aliás, afinal, principalmente, em razão disso, nesse sentido

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CORREÇÃO 2 — VOZ PASSIVA (meta: ≤ 10% das frases)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Identifique frases com voz passiva: construções com ser/estar/foi/são/foram/será/serão + particípio.
Reescreva-as na voz ativa colocando o agente como sujeito.
Exemplos:
  "o imposto é calculado pela Receita" → "a Receita calcula o imposto"
  "as alíquotas foram aprovadas pelo Congresso" → "o Congresso aprovou as alíquotas"
  "a declaração deve ser entregue" → "o contribuinte deve entregar a declaração"
Se a conversão deixar a frase visivelmente mais curta, expanda com um detalhe já presente no artigo (prazo, percentual, exemplo). Nunca invente dados.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CORREÇÃO 3 — TAMANHO DE PARÁGRAFO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Regra 1: todo parágrafo de texto corrido com mais de 55 palavras deve ser quebrado em dois, cada um com seu próprio foco.
Regra 2: nunca dois parágrafos acima de 40 palavras em sequência. Se houver, insira um parágrafo curto (15 a 25 palavras) entre eles.
Esta correção NÃO se aplica a bullet points, listas com "-" ou títulos H2/H3.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CORREÇÃO 4 — H3 LOGO APÓS H2
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Procure por padrões onde um H3 (###) aparece logo após um H2 (##) sem parágrafo de texto entre eles.
Se encontrar, insira 1 parágrafo introdutório de 1 a 2 frases apresentando o conteúdo da seção, antes do H3.
O parágrafo inserido conta nas 300 palavras da seção H2.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
REGRAS ABSOLUTAS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Preserve TODO o conteúdo: fatos, dados, leis, nomes, argumentos — não remova nada
- Preserve TODOS os links markdown [texto](url) exatamente como estão
- Preserve a estrutura de títulos # ## ### sem alteração
- O artigo de saída deve ter o mesmo número de palavras (tolerância ±5%) — se encurtar, compense expandindo ideias já presentes
- Não altere fatos, números ou nomes

Retorne APENAS o artigo completo. Sem explicações ou comentários.

ARTIGO:
${textoCompleto}`,

  // ─── AUDITORIA ────────────────────────────────────────────────────────────────
  // Checklist binário — ChatGPT responde true/false por critério
  // Score é calculado pelo JavaScript com base no checklist
  auditoria: (textoCompleto, rodada) => `Você é editor-chefe de conteúdo tributário. Leia o artigo abaixo e responda cada critério com true (ok) ou false (problema).

Seja rigoroso. Em caso de dúvida, responda false.

ARTIGO:
${textoCompleto}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CRITÉRIOS — responda true ou false para cada um
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

A1_legislacao_verificavel
Definição: todas as leis citadas com número são reais e verificáveis.
False se: o artigo citar qualquer lei com número duvidoso, incorreto ou inventado.
Leis seguras (podem ter número): LC 123/2006, LC 116/2003, CTN, CF/1988. Qualquer outra deve aparecer sem número.

A2_secoes_completas
Definição: todas as seções H2 têm conteúdo completo.
False se: qualquer seção H2 terminar abruptamente, sem encerrar o raciocínio.

A3_sem_linguagem_ia
Definição: o artigo está livre de linguagem de IA.
False se: qualquer uma dessas expressões aparecer: "no cenário atual", "é crucial", "vale ressaltar", "vale destacar", "neste contexto", "em suma", "mais do que nunca", "é importante destacar", "é fundamental", "cabe destacar", "diante disso", "robusto", "abrangente", "transformador", "dinâmico", "holístico", "alavancar", "impulsionar", "potencializar", "sinergias", "paradigma".

A4_faq_4_perguntas
Definição: o artigo tem exatamente 4 perguntas no FAQ, cada uma com resposta completa.
False se: houver menos de 4 perguntas, ou se alguma resposta estiver incompleta.

A5_conclusao_presente
Definição: há uma seção ## Conclusão com ao menos 2 parágrafos de texto.
False se: a conclusão estiver ausente, ou tiver apenas 1 parágrafo.

A6_cta_presente
Definição: há um parágrafo final convidando o leitor a falar com a Sittax.
False se: o CTA estiver ausente.

A7_lista_topicos
Definição: o artigo tem ao menos uma lista de bullet points com "-" em uma seção H2.
False se: não houver nenhuma lista com "-" no artigo inteiro.

A8_minimo_4_hiperlinks
Definição: o artigo tem 4 ou mais hiperlinks no formato [texto](url).
False se: o total de hiperlinks for menor que 4. Informe quantos há no campo "problemas".

A9_paragrafos_curtos
Definição: todos os parágrafos de texto corrido têm 55 palavras ou menos, e nunca há dois parágrafos acima de 40 palavras em sequência.
False se: qualquer parágrafo ultrapassar 55 palavras, OU se dois parágrafos acima de 40 palavras estiverem seguidos.
Bullet points e listas com "-" estão isentos desta regra.

A10_secoes_h2_ate_300
Definição: nenhuma seção H2 tem mais de 300 palavras de texto corrido entre dois headings consecutivos.
False se: qualquer seção ultrapassar 300 palavras. Informe qual seção é a problemática.

A11_h3_com_paragrafo
Definição: todo H3 tem ao menos um parágrafo de texto antes dele, dentro do mesmo bloco H2.
False se: qualquer H3 aparecer diretamente após um H2 sem parágrafo intermediário.

B1_transicao_verde
Definição: pelo menos 30% das frases do artigo contêm uma palavra de transição.
Como avaliar: estime contando frases e verificando se têm palavras como: portanto, assim, além disso, no entanto, por isso, dessa forma, ou seja, conforme, já que, bem como, contudo, todavia, pois, logo, inclusive, de fato, em razão disso, nesse sentido, por exemplo, apesar disso.
False se: o percentual estimado for menor que 30%.

B2_passiva_verde
Definição: menos de 10% das frases estão na voz passiva.
Voz passiva: construções com ser/estar/foi/são/foram/será/serão + particípio (ex: "é definido", "foram aprovadas").
False se: o percentual estimado for maior que 10%.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PROBLEMAS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Para cada critério marcado como false, escreva uma descrição concreta no array "problemas".
Exemplos de descrições boas:
- "A3: encontrado 'vale ressaltar' no 3º parágrafo da seção Substituição Tributária"
- "A9: parágrafo de 68 palavras na seção Obrigações Acessórias — deve ser quebrado"
- "A8: apenas 3 hiperlinks encontrados — falta 1"
- "B1: estimativa de 22% de frases com transição — abaixo do mínimo de 30%"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FORMATO DE RESPOSTA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Responda SOMENTE em JSON válido. Nenhum texto antes ou depois. Nenhum bloco de código.

{
  "checklist": {
    "A1_legislacao_verificavel": true,
    "A2_secoes_completas": true,
    "A3_sem_linguagem_ia": true,
    "A4_faq_4_perguntas": true,
    "A5_conclusao_presente": true,
    "A6_cta_presente": true,
    "A7_lista_topicos": true,
    "A8_minimo_4_hiperlinks": true,
    "A9_paragrafos_curtos": true,
    "A10_secoes_h2_ate_300": true,
    "A11_h3_com_paragrafo": true,
    "B1_transicao_verde": true,
    "B2_passiva_verde": true
  },
  "problemas": [],
  "yoast": {
    "percentual_transicao": 33,
    "status_transicao": "verde",
    "percentual_passiva": 7,
    "status_passiva": "verde"
  },
  "resumo": "Veredicto em 1-2 frases"
}`,

  // ─── BUSCAR FONTES ────────────────────────────────────────────────────────────
  // ChatGPT usa web_search para encontrar URLs reais de leis e dados citados
  buscarFontes: (textoCompleto) => `Você é especialista em fontes do direito tributário brasileiro.

Analise o trecho abaixo e identifique menções a leis, normas e dados que deveriam ter uma URL de fonte.
Para cada item identificado, use web_search para encontrar a URL oficial real.

Fontes prioritárias:
- Leis federais → planalto.gov.br
- Instruções Normativas RFB → normas.receita.fazenda.gov.br
- IBGE, Sebrae, IBPT → sites oficiais de cada órgão

REGRAS:
- Inclua no JSON APENAS URLs que você encontrou na busca — NUNCA invente
- Se não encontrar URL real para um item, não o inclua
- Máximo 4 fontes
- Se não encontrar nenhuma, retorne {"fontes":[]}

Responda SOMENTE com o JSON abaixo. Nenhum texto antes ou depois.
{"fontes":[{"ancora":"texto exato que aparece no artigo","url":"https://url-real-encontrada.gov.br"}]}

TRECHO DO ARTIGO:
${textoCompleto.slice(0, 800)}`,

  // ─── INSERIR FONTES ───────────────────────────────────────────────────────────
  inserirFontes: (textoCompleto, fontes) => `Você é editor de conteúdo da Sittax.

Insira os links de fontes abaixo no artigo, nos trechos onde as âncoras aparecem.

FONTES A INSERIR:
${fontes.map((f, i) => (i+1) + '. Âncora: "' + f.ancora + '" → URL: ' + f.url).join('\n')}

REGRAS:
- Formato markdown: [âncora exata](url)
- Insira o link na primeira ocorrência da âncora no texto
- Máximo 1 link por âncora
- Não altere nenhuma outra parte do texto
- Preserve todos os links já existentes

Retorne APENAS o artigo completo. Comece com o # do título. Sem comentários.

ARTIGO:
${textoCompleto}`,

  // ─── LINKS INTERNOS ───────────────────────────────────────────────────────────
  // ChatGPT insere exatamente 3 links internos do blog Sittax
  linksInternos: (textoCompleto) => `Você é especialista em SEO da Sittax.

Insira exatamente 3 links internos do blog Sittax no artigo abaixo.

LINKS DISPONÍVEIS (escolha os 3 mais relevantes para o tema do artigo):
1. [Contador 2026: tendências e oportunidades](https://sittax.com.br/blog/sittax-cast/contador-2026/) — futuro do contador, oportunidades e desafios para 2026
2. [Gestão de equipes e inteligência de dados na contabilidade digital](https://sittax.com.br/blog/sittax-cast/gestao-equipes-inteligencia-dados-contabilidade-digital/) — gestão de escritórios com dados e tecnologia
3. [Malha fina, IR e desenquadramento do Simples Nacional](https://sittax.com.br/blog/sittax-cast/malha-fina-imposto-desenquadramento-simples-nacional/) — fiscalização digital e riscos de desenquadramento
4. [Tributação como ativo estratégico](https://sittax.com.br/blog/sittax-cast/sittaxcast-14-tributacao-como-ativo-transforme-o-fiscal-em-motor-de-crescimento/) — como usar o fiscal como motor de crescimento
5. [O contador do futuro: tecnologia e Reforma Tributária](https://sittax.com.br/blog/sittax-cast/sittaxcast-13-o-contador-do-futuro-tecnologia-reforma-tributaria-e-reinvencao/) — impacto da Reforma Tributária e IA no setor contábil
6. [Segurança da informação na contabilidade](https://sittax.com.br/blog/sittax-cast/sittaxcast-10-seguranca-da-informacao-na-contabilidade-seus-dados-estao-protegidos/) — proteção de dados para escritórios
7. [Reforma Tributária: split payment, precificação e fluxo de caixa](https://sittax.com.br/artigo/reforma-tributaria-split-payment-precificacao-fluxo-caixa/) — impacto do split payment no B2B
8. [Segregação automática no Simples Nacional](https://sittax.com.br/artigo/segregacao-automatica-simples-nacional/) — automação da segregação fiscal
9. [Regularização no Simples Nacional](https://sittax.com.br/artigo/regularizacao-simples-nacional/) — como regularizar pendências e evitar exclusão

REGRAS:
- Insira EXATAMENTE 3 links — nem mais, nem menos
- O âncora de cada link deve ser uma expressão JÁ EXISTENTE no texto — não adicione palavras novas
- Se a expressão exata não existir, use a expressão mais próxima que apareça no texto
- Nunca repita o mesmo link duas vezes
- Preserve todos os links externos já existentes no artigo
- Não altere nenhuma outra parte do texto

VERIFICAÇÃO OBRIGATÓRIA antes de retornar: conte os links sittax.com.br que você inseriu. Se for diferente de 3, corrija antes de retornar.

Retorne APENAS o artigo completo. Comece com o # do título. Sem comentários.

ARTIGO:
${textoCompleto}`,

  // ─── REVISÃO ──────────────────────────────────────────────────────────────────
  // Corrige os problemas identificados pela auditoria
  revisar: (textoCompleto, problemas) => `Você é redator especialista da Sittax.

Reescreva o artigo abaixo corrigindo TODOS os problemas listados. Não altere nada além do necessário para corrigir cada problema.

PROBLEMAS A CORRIGIR:
${problemas.map((p, i) => `${i + 1}. ${p}`).join("\n")}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
COMO CORRIGIR CADA TIPO DE PROBLEMA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SE A1 (legislação): substitua qualquer lei com número duvidoso por "conforme a legislação tributária vigente". Mantenha apenas LC 123/2006, LC 116/2003, CTN e CF/1988 se já estiverem corretos.

SE A3 (linguagem de IA): substitua as expressões proibidas por linguagem direta de contador.
Proibidas: "robusto", "abrangente", "alavancar", "transformador", "dinâmico", "holístico", "é crucial", "vale ressaltar", "neste contexto", "em suma", "mais do que nunca", "cabe destacar", "diante disso", "impulsionar", "potencializar".
Substitua por linguagem direta: em vez de "é crucial entender", escreva "o contador precisa entender"; em vez de "alavancar resultados", escreva "melhorar os resultados".

SE A4 (FAQ incompleto): adicione as perguntas faltantes seguindo o formato ### [pergunta] / [resposta de 3-4 frases].

SE A5 (conclusão): adicione ou expanda a seção ## Conclusão com ao menos 2 parágrafos de 20 a 50 palavras cada.

SE A6 (CTA ausente): adicione um parágrafo final convidando o leitor a falar com a Sittax sobre o caso específico da empresa.

SE A7 (sem lista de bullet points): escolha a seção H2 mais adequada sem H3s, adicione um parágrafo introdutório e uma lista com mínimo 3 itens no formato "- texto".

SE A8 (hiperlinks insuficientes): adicione hiperlinks reais nos trechos que citam leis, órgãos, dados ou fontes.
Formato: [âncora natural](url). Use URLs de: planalto.gov.br, gov.br/receitafederal, sebrae.com.br, ibge.gov.br, contabeis.com.br, cfc.org.br.
NUNCA invente URLs — só insira links de fontes que você conhece com certeza.

SE A9 (parágrafos longos): quebre todo parágrafo acima de 55 palavras em dois. Se houver dois parágrafos acima de 40 palavras seguidos, insira um parágrafo curto (15 a 25 palavras) entre eles. Bullet points estão isentos.

SE A10 (seção H2 > 300 palavras): não corte conteúdo. Localize o ponto natural de divisão e insira um ### com subtítulo descritivo. Se não couber H3, crie um novo ## e continue o conteúdo lá.

SE A11 (H3 sem parágrafo antes): insira 1 parágrafo de 1 a 2 frases antes do H3, apresentando o conteúdo da seção.

SE B1 (transição < 30%): insira palavras de transição nas frases mais "soltas", variando posição (início, meio ou fim).
Use: portanto, assim, além disso, no entanto, por isso, dessa forma, ou seja, ainda assim, conforme, por outro lado, já que, bem como, contudo, todavia, inclusive, pois, logo, de fato, nesse sentido, em razão disso.

SE B2 (voz passiva > 10%): reescreva as frases passivas na voz ativa.
Passiva: "o imposto é calculado pela Receita" → Ativa: "a Receita calcula o imposto"
Passiva: "as alíquotas foram definidas pela lei" → Ativa: "a lei definiu as alíquotas"
Se não houver agente claro: "deve ser entregue" → "o contribuinte deve entregar"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
REGRAS ABSOLUTAS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Preserve TODO o conteúdo: fatos, dados, números, leis, nomes — não remova nada
- Preserve TODOS os links markdown [texto](url) exatamente como estão
- Preserve a estrutura de títulos # ## ### sem alteração
- Mantenha FAQ com 4 perguntas, Conclusão e CTA
- Não invente dados, leis ou URLs

Retorne o artigo completo corrigido, com todos os títulos # ## ###. Sem comentários.

ARTIGO:
${textoCompleto}`,

  // ─── AUDITORIA YOAST ──────────────────────────────────────────────────────────
  // Calcula transição e voz passiva com precisão — etapa dedicada após os links
  auditoriaYoast: (textoCompleto) => `Você é revisor especialista em legibilidade de textos em português brasileiro.

Analise o artigo abaixo e calcule dois indicadores de legibilidade.

ARTIGO:
${textoCompleto}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CÁLCULO 1 — PALAVRAS DE TRANSIÇÃO (meta: ≥ 30%)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Separe todas as frases do artigo (delimite por "." "!" "?"). Ignore: títulos H1/H2/H3, itens de lista iniciados com "-", URLs.
2. Para cada frase, verifique se contém ao menos uma palavra/expressão de transição da lista abaixo.
3. Calcule: (frases com transição ÷ total de frases) × 100. Arredonde para inteiro.
4. Se o percentual for menor que 30%, liste até 8 frases que NÃO têm transição e que são boas candidatas para receber uma.

Lista de transições válidas: portanto, assim, além disso, no entanto, por isso, dessa forma, ou seja, ainda assim, conforme, por outro lado, já que, uma vez que, bem como, em seguida, por exemplo, contudo, todavia, inclusive, pois, logo, apesar disso, de fato, ao mesmo tempo, anteriormente, posteriormente, sobretudo, certamente, então, entretanto, aliás, afinal, principalmente, em razão disso, nesse sentido, por consequência, dessa maneira

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CÁLCULO 2 — VOZ PASSIVA (meta: ≤ 10%)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Identifique todas as frases com voz passiva: construções com ser/estar/foi/são/foram/será/serão + particípio.
   Exemplos: "é calculado", "foram aprovadas", "será regulamentado", "são consideradas".
2. Calcule: (frases passivas ÷ total de frases) × 100. Arredonde para inteiro.
3. Se o percentual for maior que 10%, liste TODAS as frases passivas encontradas.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FORMATO DE RESPOSTA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Responda SOMENTE em JSON válido. Nenhum texto antes ou depois. Nenhum bloco de código.

{
  "total_frases": 80,
  "transicao": {
    "frases_com_transicao": 28,
    "percentual": 35,
    "status": "verde",
    "frases_sem_transicao": []
  },
  "passiva": {
    "frases_passivas": 6,
    "percentual": 7,
    "status": "verde",
    "frases_encontradas": []
  },
  "aprovado": true
}

Regras do JSON:
- "status": "verde" se ok, "vermelho" se problema
- "aprovado": true apenas se transição ≥ 30% E passiva ≤ 10%
- "frases_sem_transicao": preencha apenas se status da transição for "vermelho"
- "frases_encontradas": preencha apenas se status da passiva for "vermelho"`,

  // ─── REVISÃO YOAST ────────────────────────────────────────────────────────────
  // Correção cirúrgica de transição e voz passiva — não altera mais nada
  revisaoYoast: (textoCompleto, dadosAuditoria) => `Você é revisor especialista em legibilidade de textos em português brasileiro.

Corrija APENAS os problemas de legibilidade listados abaixo. Não altere mais nada.

PROBLEMAS A CORRIGIR:
${dadosAuditoria}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
REGRAS ABSOLUTAS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Preserve TODO o conteúdo, dados, leis e nomes
- Preserve TODOS os links markdown [texto](url) exatamente como estão
- Preserve a estrutura de títulos # ## ### sem nenhuma alteração
- Preserve bullet points e listas com "-" exatamente como estão
- NÃO remova seções, parágrafos ou frases

SE HOUVER PROBLEMA DE TRANSIÇÃO (percentual < 30%):
Insira palavras de transição nas frases listadas como candidatas. Varie a posição: início, meio ou fim.
Exemplos: "A empresa, portanto, deve..." / "Além disso, o prazo..." / "...o que inclui, inclusive, os optantes do Simples."
Use: portanto, assim, além disso, no entanto, por isso, dessa forma, ou seja, ainda assim, conforme, por outro lado, já que, bem como, contudo, todavia, inclusive, pois, logo, de fato, nesse sentido, em razão disso

SE HOUVER PROBLEMA DE VOZ PASSIVA (percentual > 10%):
Reescreva APENAS as frases listadas, convertendo para voz ativa.
Coloque o agente como sujeito: "a Receita calcula" em vez de "é calculado pela Receita".
Se não houver agente claro, use sujeito genérico: "o contribuinte deve entregar" em vez de "deve ser entregue".

Retorne APENAS o artigo completo corrigido, com todos os títulos # ## ###. Sem comentários.

ARTIGO:
${textoCompleto}`,

  // ─── BUSCA DE LINKS INTERNOS (fallback) ───────────────────────────────────────
  buscaLinksInternos: (tema) => `Você é especialista em SEO da Sittax.

Use web_search para encontrar artigos reais do blog da Sittax relacionados ao tema "${tema}".
Faça 3 a 4 buscas variadas: site:sittax.com.br/blog [keyword do tema]

Retorne SOMENTE o JSON abaixo. Nenhum texto antes ou depois.
{
  "artigos": [
    { "titulo": "Título do artigo", "url": "https://sittax.com.br/blog/slug", "relevancia": "por que é relevante para o tema" }
  ]
}
Máximo 4 artigos. Só inclua URLs que você realmente encontrou — NUNCA invente.`,

  // ─── INSERIR LINKS INTERNOS (fallback) ────────────────────────────────────────
  inserirLinksInternos: (textoCompleto, artigos) => `Você é especialista em SEO da Sittax.

Insira os links internos abaixo no artigo, nos trechos mais relevantes.

LINKS A INSERIR:
${artigos.map((a, i) => (i+1) + ". [" + a.titulo + "](" + a.url + ") — " + a.relevancia).join("\n")}

REGRAS:
- Máximo 4 links internos no total
- O âncora deve ser uma expressão JÁ EXISTENTE no texto — não adicione palavras novas
- Não altere nenhuma outra parte do texto
- Preserve todos os links externos já existentes

Retorne APENAS o artigo completo. Comece com o # do título. Sem comentários.

ARTIGO:
${textoCompleto}`,

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

// ── Calcula score a partir do checklist binário ──────────────────────────────
function calcularScore(checklist) {
  if (!checklist) return { score: 0 };
  const pesos = {
    A1_legislacao_verificavel: 10,
    A2_secoes_completas:        8,
    A3_sem_linguagem_ia:        8,
    A4_faq_4_perguntas:         7,
    A5_conclusao_presente:      7,
    A6_cta_presente:            5,
    A7_lista_topicos:           5,
    A8_minimo_4_hiperlinks:     7,
    A9_paragrafos_curtos:       6,
    A10_secoes_h2_ate_300:      5,
    A11_h3_com_paragrafo:       7,
    B1_transicao_verde:        10,
    B2_passiva_verde:          10,
  };
  let score = 100;
  for (const [key, ok] of Object.entries(checklist)) {
    if (!ok && pesos[key]) score -= pesos[key];
  }
  return { score: Math.max(0, score) };
}

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
    p{margin-bottom:11px;text-align:left}
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
  { id: "links_blog",     label: "Links Blog",  icon: "🏠" },
  { id: "auditoria2",     label: "Auditoria 2", icon: "🔎" },
  { id: "revisao2",        label: "Revisão 2",   icon: "✅" },
  { id: "polimento_final", label: "Pol. Final",  icon: "🪄" },
  { id: "auditoria_yoast", label: "Yoast",       icon: "📊" },
  { id: "revisao_yoast",   label: "Rev. Yoast",  icon: "🔤" },
  { id: "pronto",          label: "Pronto",      icon: "🎉" },
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
      // ── Auditoria 1 ───────────────────────────────────────────────────────────
      setFase("auditoria1");
      log_("Auditoria 1/2 — verificando qualidade, Yoast e linguagem... (ChatGPT)");
      await pausa(2, "", log_);
      const rawA1 = await callGPT(PROMPTS.auditoria(textoFinal, 1), 1500);
      const ad1 = parseJSON(rawA1);
      if (ad1) {
        const { score: score1Calc } = calcularScore(ad1.checklist);
        ad1.score_geral = score1Calc;
        auditFinal = ad1;
        const yoast1Ok = !ad1.yoast || (ad1.yoast.status_transicao === "verde" && ad1.yoast.status_passiva === "verde");
        const score1Ok = score1Calc >= 90 && yoast1Ok;
        log_(
          `✓ Score rodada 1: ${score1Calc}/100` +
          (ad1.yoast ? ` | Transição: ${ad1.yoast.percentual_transicao}% (${ad1.yoast.status_transicao}) | Passiva: ${ad1.yoast.percentual_passiva}% (${ad1.yoast.status_passiva})` : "") +
          (score1Ok ? " — aprovado ✓" : " — revisando..."),
          score1Ok ? "ok" : "warn"
        );
        const problemas1 = (ad1.problemas || []).filter(p => p?.trim() && p.length > 5);
        if (!score1Ok || problemas1.length > 0) {
          // ── Revisão 1 ───────────────────────────────────────────────────────
          setFase("revisao1");
          log_(`Revisão 1/2 — corrigindo ${problemas1.length} problema(s)... (ChatGPT)`, "warn");
          problemas1.forEach(p => log_(`  → ${p}`, "warn"));
          await pausa(2, "", log_);
          const revisado1 = await callGPT(PROMPTS.revisar(textoFinal, problemas1), 6000);
          if (revisado1?.length > 500) {
            textoFinal = revisado1; setArtigo(revisado1);
            log_(`✓ Revisão 1 aplicada — ${contarPalavras(revisado1)} palavras`, "ok");
          } else { log_("⚠ Revisão 1 retornou texto curto, mantendo versão anterior.", "warn"); }
        } else { log_(`✓ Artigo aprovado na rodada 1 (score ${ad1.score_geral}/100)`, "ok"); }
      } else { log_("⚠ Auditoria 1 não retornou JSON válido, pulando.", "warn"); }

      // ── Fontes externas — sempre executado ───────────────────────────────────
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

      // ── Links internos do blog Sittax — sempre executado ─────────────────────
      setFase("links_blog");
      log_("Inserindo links internos do blog Sittax... (ChatGPT)");
      await pausa(2, "", log_);
      try {
        const comLinksInt = await callGPT(PROMPTS.linksInternos(textoFinal), 5000);
        const h1idx2 = comLinksInt.indexOf("#");
        const textoComInt = h1idx2 > 0 ? comLinksInt.slice(h1idx2).trim() : comLinksInt.trim();
        if (textoComInt?.length > 500) {
          textoFinal = textoComInt; setArtigo(textoComInt);
          const qtdInt = (textoComInt.match(/\[.+?\]\(https?:\/\/sittax\.com\.br\/.+?\)/g) || []).length;
          log_("✓ " + qtdInt + " link(s) interno(s) do blog inserido(s)", "ok");
        } else { log_("⚠ Links internos retornou texto curto — mantendo versão anterior.", "warn"); }
      } catch (e) { log_(`⚠ Links internos falhou (${e.message}). Continuando.`, "warn"); }

      // ── Auditoria 2 ───────────────────────────────────────────────────────────
      setFase("auditoria2");
      log_("Auditoria 2/2 — verificação final de qualidade... (ChatGPT)");
      await pausa(2, "", log_);
      const rawA2 = await callGPT(PROMPTS.auditoria(textoFinal, 2), 1500);
      const ad2 = parseJSON(rawA2);
      if (ad2) {
        const { score: score2Calc } = calcularScore(ad2.checklist);
        ad2.score_geral = score2Calc;
        auditFinal = ad2;
        const yoast2Ok = !ad2.yoast || (ad2.yoast.status_transicao === "verde" && ad2.yoast.status_passiva === "verde");
        const score2Ok = score2Calc >= 90 && yoast2Ok;
        log_(
          `✓ Score rodada 2: ${score2Calc}/100` +
          (ad2.yoast ? ` | Transição: ${ad2.yoast.percentual_transicao}% (${ad2.yoast.status_transicao}) | Passiva: ${ad2.yoast.percentual_passiva}% (${ad2.yoast.status_passiva})` : "") +
          (score2Ok ? " — aprovado ✓" : " — entregando melhor versão"),
          score2Ok ? "ok" : "warn"
        );
        const problemas2 = (ad2.problemas || []).filter(p => p?.trim() && p.length > 5);
        if (!score2Ok || problemas2.length > 0) {
          // ── Revisão 2 ─────────────────────────────────────────────────────
          setFase("revisao2");
          log_(`Revisão 2/2 — corrigindo ${problemas2.length} problema(s)... (ChatGPT)`, "warn");
          problemas2.forEach(p => log_(`  → ${p}`, "warn"));
          await pausa(2, "", log_);
          const revisado2 = await callGPT(PROMPTS.revisar(textoFinal, problemas2), 6000);
          if (revisado2?.length > 500) {
            textoFinal = revisado2; setArtigo(revisado2);
            log_(`✓ Revisão 2 aplicada — ${contarPalavras(revisado2)} palavras`, "ok");
          } else { log_("⚠ Revisão 2 retornou texto curto, mantendo versão anterior.", "warn"); }
        } else { log_(`✓ Artigo aprovado na rodada 2 (score ${ad2.score_geral}/100)`, "ok"); }
      } else { log_("⚠ Auditoria 2 não retornou JSON válido, pulando.", "warn"); }

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

      // ── Auditoria Yoast dedicada ─────────────────────────────────────────
      setFase("auditoria_yoast");
      log_("Auditoria Yoast — verificando transição e voz passiva... (ChatGPT)");
      await pausa(2, "", log_);
      try {
        const rawYoast = await callGPT(PROMPTS.auditoriaYoast(textoFinal), 1500);
        const dyoast = parseJSON(rawYoast);
        if (dyoast) {
          const yAprovado = dyoast.aprovado;
          log_(
            `✓ Yoast — Transição: ${dyoast.transicao?.percentual ?? "?"}% (${dyoast.transicao?.status ?? "?"}) | Passiva: ${dyoast.passiva?.percentual ?? "?"}% (${dyoast.passiva?.status ?? "?"})` +
            (yAprovado ? " — aprovado ✓" : " — corrigindo..."),
            yAprovado ? "ok" : "warn"
          );
          if (!yAprovado) {
            // ── Revisão Yoast ───────────────────────────────────────────────
            setFase("revisao_yoast");
            const problemaDesc = [
              dyoast.transicao?.status === "vermelho"
                ? "TRANSIÇÃO: " + dyoast.transicao.percentual + "% das frases têm transição (meta: ≥30%). Frases candidatas:\n" +
                  (dyoast.transicao.frases_sem_transicao || []).map(f => "  - " + f).join("\n")
                : null,
              dyoast.passiva?.status === "vermelho"
                ? "VOZ PASSIVA: " + dyoast.passiva.percentual + "% das frases estão na voz passiva (meta: ≤10%). Frases a corrigir:\n" +
                  (dyoast.passiva.frases_encontradas || []).map(f => "  - " + f).join("\n")
                : null,
            ].filter(Boolean).join("\n\n");
            log_("Rev. Yoast — aplicando correções cirúrgicas... (ChatGPT)", "warn");
            await pausa(2, "", log_);
            const revisadoYoast = await callGPT(PROMPTS.revisaoYoast(textoFinal, problemaDesc), 6000);
            if (revisadoYoast?.length > 500) {
              textoFinal = revisadoYoast; setArtigo(revisadoYoast);
              log_(`✓ Rev. Yoast aplicada — ${contarPalavras(revisadoYoast)} palavras`, "ok");
            } else { log_("⚠ Rev. Yoast retornou texto curto — mantendo versão anterior.", "warn"); }
          }
        } else { log_("⚠ Auditoria Yoast não retornou JSON válido, pulando.", "warn"); }
      } catch (e) { log_(`⚠ Auditoria Yoast falhou (${e.message}). Continuando.`, "warn"); }

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
        @media (max-width: 600px) {
          .sittax-header { flex-direction: column !important; align-items: flex-start !important; gap: 10px !important; }
          .sittax-badge { display: none !important; }
          .sittax-input-row { flex-direction: column !important; }
          .sittax-btn { width: 100% !important; text-align: center !important; }
          .sittax-card-pad { padding: 16px !important; }
          .sittax-phases { overflow-x: auto !important; padding-bottom: 4px !important; }
          .sittax-phases::-webkit-scrollbar { height: 3px; }
          .sittax-phases::-webkit-scrollbar-thumb { background: #ddd; border-radius: 2px; }
          .sittax-audit-grid { flex-direction: column !important; }
          .sittax-log { padding: 10px 14px !important; }
        }
      `}</style>

      {/* ── Header ── */}
      <div className="sittax-header" style={{ width: "100%", maxWidth: "760px", marginBottom: "24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
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
        <div className="sittax-badge" style={{ fontSize: "11px", color: BRAND.textLight, fontWeight: "500", background: "#F0F0F0", padding: "4px 10px", borderRadius: "20px" }}>
          Pesquisa · Corpo · FAQ · Auditoria · PDF
        </div>
      </div>

      {/* ── Card principal ── */}
      <div style={{ width: "100%", maxWidth: "760px", background: BRAND.card, borderRadius: BRAND.radiusLg, border: `1px solid ${BRAND.border}`, boxShadow: "0 1px 6px rgba(0,0,0,0.07)", overflow: "hidden" }}>

        {/* Input */}
        <div className="sittax-card-pad" style={{ padding: "24px 28px", borderBottom: `1px solid ${BRAND.border}` }}>

          {/* Linha do tema + botão */}
          <label style={{ display: "block", fontSize: "11px", fontWeight: "600", color: BRAND.textMuted, marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Tema do artigo
          </label>
          <div className="sittax-input-row" style={{ display: "flex", gap: "10px" }}>
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
              className="sittax-btn"
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
          <div ref={logRef} className="sittax-log" style={{ padding: "14px 28px", borderBottom: fase === "pronto" || audit ? `1px solid ${BRAND.border}` : undefined, maxHeight: "180px", overflowY: "auto", background: "#FAFAFA" }}>
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
