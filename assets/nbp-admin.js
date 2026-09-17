(function (global) {
  var STORAGE = "nbp-admin";
  var SESSION = "nbp-admin-session";
  var VERSION = 2;

  var SETORES = {
    mkt: "Agência de Marketing",
    marca: "Marca Pessoal",
    com: "Agência de Comunicação",
    dados: "Especialista em Dados",
    saude: "Saúde e Bem-estar",
    foto: "Fotografia",
    va: "Assistente Virtual",
    desp: "Desporto"
  };

  var FILE_TYPES = {
    doc: { ic: "fa-file-word", color: "#7FB6EE", label: "Word" },
    gdoc: { ic: "fa-file-lines", color: "#7FB6EE", label: "Documento" },
    xls: { ic: "fa-file-excel", color: "#5FC7A4", label: "Excel" },
    gsheet: { ic: "fa-table", color: "#5FC7A4", label: "Folha" },
    pdf: { ic: "fa-file-pdf", color: "#E88585", label: "PDF" }
  };

  var MES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
  var MAB = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
  var DIAS = ["seg", "ter", "qua", "qui", "sex", "sáb", "dom"];
  var CAMPOS = [
    { k: "mrr", lb: "MRR", pre: "€", dec: 0, up: 1 },
    { k: "rec", lb: "Receita total", pre: "€", dec: 0, up: 1 },
    { k: "nov", lb: "Novos clientes", pre: "", dec: 0, up: 1 },
    { k: "act", lb: "Clientes ativos", pre: "", dec: 0, up: 1 },
    { k: "chu", lb: "Churn", pre: "", suf: "%", dec: 1, up: 0 },
    { k: "lea", lb: "Leads", pre: "", dec: 0, up: 1 }
  ];
  var COLS = [
    { s: "none", lb: "Não iniciado" },
    { s: "todo", lb: "Em andamento" },
    { s: "done", lb: "Concluído" }
  ];
  var STAGE_STATUS = [
    { s: "done", lb: "Concluída" },
    { s: "current", lb: "Atual" },
    { s: "locked", lb: "Bloqueada" }
  ];

  function uid(prefix) {
    return (prefix || "id") + "-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  }

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function initials(name) {
    return String(name || "?")
      .split(/\s+/)
      .slice(0, 2)
      .map(function (p) { return p.charAt(0); })
      .join("")
      .toUpperCase();
  }

  function ky(d) {
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }

  function fileIds(list) {
    return (list || []).map(function (f, i) {
      return { id: f.id || ("file-" + i + "-" + Math.random().toString(36).slice(2, 5)), n: f.n, t: f.t };
    });
  }

  function planKey(y, m) {
    return y + "-" + m;
  }

  function prevPlanKey(y, m) {
    return m === 0 ? planKey(y - 1, 11) : planKey(y, m - 1);
  }

  function emptyMonth(mesLabel) {
    return {
      met: { mrr: "", rec: "", nov: "", act: "", chu: "", lea: "" },
      obj: [],
      desafio: {
        title: "Novo desafio de " + mesLabel,
        sub: "Define as etapas deste mês com o mentor.",
        flagMain: "Em breve",
        flagPrefix: "foco",
        flagTarget: "a definir",
        fill: "0%",
        stages: [
          { name: "Início", status: "current", sub: "agora" },
          { name: "Etapa 2", status: "locked", sub: "—" },
          { name: "Etapa 3", status: "locked", sub: "—" },
          { name: "Etapa 4", status: "locked", sub: "—" },
          { name: "Etapa 5", status: "locked", sub: "—" },
          { name: "Etapa 6", status: "locked", sub: "—" },
          { name: "Etapa 7", status: "locked", sub: "—" },
          { name: "Etapa 8", status: "locked", sub: "—" },
          { name: "Etapa 9", status: "locked", sub: "—" }
        ]
      },
      tela: [],
      v: { ox: 0, oy: 0, z: 1 }
    };
  }

  function seedRoquePlans() {
    return {
      "m-roque": {
        "2026-6": {
          met: { mrr: 11200, rec: 44100, nov: 5, act: 22, chu: 2.8, lea: 241 },
          desafio: {
            title: "Oferta irresistível",
            sub: "Etapa 3 de 9 — fechar a proposta e validar com clientes reais.",
            flagMain: "Concluído",
            flagPrefix: "marco",
            flagTarget: "Oferta validada",
            fill: "28%",
            stages: [
              { name: "Página em branco", status: "done", sub: "01 jul" },
              { name: "Posicionamento", status: "done", sub: "08 jul" },
              { name: "Oferta irresistível", status: "done", sub: "18 jul" },
              { name: "Aquisição de clientes", status: "locked", sub: "próximo" },
              { name: "Vendas previsíveis", status: "locked", sub: "dia 45" },
              { name: "Processos", status: "locked", sub: "dia 60" },
              { name: "Equipa", status: "locked", sub: "dia 80" },
              { name: "Delegação", status: "locked", sub: "dia 100" },
              { name: "Escala", status: "locked", sub: "continue" }
            ]
          },
          obj: [
            { id: "obj-r-1", t: "Guião de descoberta escrito", s: "done", a: "m4.1" },
            { id: "obj-r-2", t: "Reduzir churn para 2,5%", s: "todo", a: null }
          ],
          tela: [
            { t: "ret", x: 70, y: 60, w: 140, h: 70, c: 0, s: 20 },
            { t: "txt", x: 96, y: 102, txt: "Retenção", c: 0, s: 1 }
          ],
          v: { ox: 0, oy: 0, z: 1 }
        },
        "2026-7": {
          met: { mrr: 13400, rec: 48200, nov: 6, act: 27, chu: 2.4, lea: 312 },
          desafio: {
            title: "Rumo à Escala Previsível",
            sub: "Etapa 4 de 9 — da página em branco ao negócio que não depende de si.",
            flagMain: "6 dias",
            flagPrefix: "para",
            flagTarget: "Vendas previsíveis",
            fill: "38.4%",
            stages: [
              { name: "Página em branco", status: "done", sub: "01 jul" },
              { name: "Posicionamento", status: "done", sub: "08 jul" },
              { name: "Oferta irresistível", status: "done", sub: "18 jul" },
              { name: "Aquisição de clientes", status: "current", sub: "45%" },
              { name: "Vendas previsíveis", status: "locked", sub: "dia 45" },
              { name: "Processos", status: "locked", sub: "dia 60" },
              { name: "Equipa", status: "locked", sub: "dia 80" },
              { name: "Delegação", status: "locked", sub: "dia 100" },
              { name: "Escala", status: "locked", sub: "continue para descobrir" }
            ]
          },
          obj: [
            { id: "obj-r-3", t: "Testar escalão a 2.400 € com dois clientes novos", s: "todo", a: "m2.4" },
            { id: "obj-r-4", t: "Enviar proposta à Vitor & Filhos", s: "todo", a: "m4.1" },
            { id: "obj-r-5", t: "Gravar o vídeo de onboarding", s: "none", a: null },
            { id: "obj-r-6", t: "Sistema de referências a funcionar", s: "done", a: "m3.3" }
          ],
          tela: [
            { t: "ret", x: 60, y: 55, w: 150, h: 78, c: 0, s: 12 },
            { t: "txt", x: 84, y: 100, txt: "Oferta 2.400 €", c: 0, s: 1 },
            { t: "set", x: 215, y: 94, w: 90, h: 0, c: 1, s: 33 },
            { t: "eli", x: 315, y: 52, w: 150, h: 86, c: 2, s: 7 },
            { t: "txt", x: 342, y: 100, txt: "2 clientes teste", c: 2, s: 2 },
            { t: "set", x: 135, y: 140, w: 0, h: 60, c: 3, s: 51 },
            { t: "txt", x: 68, y: 228, txt: "se resultar → tabela toda", c: 3, s: 3 },
            { t: "ret", x: 640, y: 70, w: 170, h: 90, c: 4, s: 61 },
            { t: "txt", x: 664, y: 122, txt: "plano B: escalões", c: 4, s: 4 }
          ],
          v: { ox: 0, oy: 0, z: 1 }
        }
      }
    };
  }

  function getMemberPlan(data, memberId) {
    if (!data.plans) data.plans = {};
    if (!data.plans[memberId]) data.plans[memberId] = {};
    return data.plans[memberId];
  }

  function fmtMetric(v, f) {
    if (v === "" || v == null) return "—";
    return (f.pre || "") + Number(v).toLocaleString("pt-PT", {
      minimumFractionDigits: f.dec, maximumFractionDigits: f.dec
    }) + (f.suf || "");
  }

  function migrate(data) {
    if (!data || typeof data !== "object") return seed();
    if (!data.plans) data.plans = seedRoquePlans();
    data._v = VERSION;
    return data;
  }

  function seed() {
    return {
      _v: VERSION,
      members: [
        { id: "m-roque", n: "Roque Buarque", e: "roque@nbp.pt", empresa: "NBP", c: "Lisboa", s: "mkt", tel: "+351 910 000 001", ig: "instagram.com/roque", bio: "Membro activo da comunidade NBP.", plan: "ativo", papel: "cliente", g: "m" },
        { id: "m-ric", n: "Ricardo Almeida", e: "r.almeida7@hotmail.com", empresa: "Performance Aveiro", c: "Aveiro", s: "mkt", tel: "+351 916 076 970", ig: "instagram.com/ricardoalmeida", bio: "Gestor de tráfego pago. A construir a própria agência.", plan: "ativo", papel: "cliente", g: "m" },
        { id: "m-alda", n: "Alda Vieira", e: "alda@aldavieira.pt", empresa: "Alda Vieira", c: "Aveiro", s: "marca", tel: "+351 912 445 118", ig: "instagram.com/aldavieira", bio: "Marca pessoal com fundadores que odeiam vender.", plan: "ativo", papel: "cliente", g: "f" },
        { id: "m-carla", n: "Carla Moreira", e: "carla.moreira@gmail.com", empresa: "Yoga nas Escolas", c: "Aveiro", s: "saude", tel: "+351 933 210 654", ig: "instagram.com/carlamoreira", bio: "Yoga para crianças. Aulas em escolas e formação de educadores.", plan: "ativo", papel: "cliente", g: "f" },
        { id: "m-tiago", n: "Tiago Ramos", e: "tiago@macromakers.pt", empresa: "MacroMakers", c: "Aveiro", s: "com", tel: "+351 927 883 401", ig: "instagram.com/macromakers", bio: "Comunicação para indústria e B2B.", plan: "ativo", papel: "cliente", g: "m" },
        { id: "m-yuri", n: "Yuri Novaes", e: "yuri.novaes@cft.pt", empresa: "CFT", c: "Braga", s: "desp", tel: "+351 938 447 220", ig: "instagram.com/yurinovaes", bio: "Centro de formação de futebol.", plan: "ativo", papel: "cliente", g: "m" },
        { id: "m-cris", n: "Cristiano Silva", e: "geral@cristianosilva.pt", empresa: "Cristiano Silva", c: "Braga", s: "foto", tel: "+351 961 337 508", ig: "instagram.com/cristianosilva", bio: "Retrato corporativo de autor.", plan: "ativo", papel: "cliente", g: "m" },
        { id: "m-avner", n: "Avner Vasconcelos", e: "avner@dadosclaros.pt", empresa: "Dados Claros", c: "Braga", s: "dados", tel: "+351 924 110 776", ig: "instagram.com/avnervasconcelos", bio: "Dashboards e automação para PME.", plan: "ativo", papel: "cliente", g: "m" },
        { id: "m-sofia", n: "Sofia Rebelo", e: "sofia.rebelo@gmail.com", empresa: "Rebelo VA", c: "Bragança", s: "va", tel: "+351 917 004 332", ig: "instagram.com/sofiarebelo", bio: "Apoio administrativo remoto a consultores.", plan: "inativo", papel: "cliente", g: "f" },
        { id: "m-ines", n: "Inês Cardoso", e: "ines@inescardoso.pt", empresa: "Inês Cardoso", c: "Porto", s: "marca", tel: "+351 913 559 274", ig: "instagram.com/inescardoso", bio: "Posicionamento e oferta com terapeutas.", plan: "ativo", papel: "cliente", g: "f" }
      ],
      modules: [
        { id: "mod-t", t: "Tutorias", sub: "terças, 18h00 · ensino e dúvidas", type: "tutoria", c: "#1E4E7E", l: "#BBD7F4" },
        { id: "mod-a", t: "Accountability", sub: "quintas, 18h00 · números e compromissos", type: "accountability", c: "#6B4310", l: "#F3D6A6" },
        { id: "mod-1", t: "Fundações", sub: "Módulo 1", type: "curso", n: 1, c: "#453C96", l: "#CFCBF7" },
        { id: "mod-2", t: "Oferta e preço", sub: "Módulo 2", type: "curso", n: 2, c: "#125A47", l: "#B4E5D3" },
        { id: "mod-3", t: "Aquisição", sub: "Módulo 3", type: "curso", n: 3, c: "#7C3218", l: "#F1C4B0" },
        { id: "mod-4", t: "Vendas", sub: "Módulo 4", type: "curso", n: 4, c: "#7C2C46", l: "#F2C0D2" }
      ],
      lessons: [
        { id: "t.con", moduleId: "mod-t", t: "Conteúdo", d: "46 min", dt: "18 ago", status: "publicado", video: "" },
        { id: "t.fin", moduleId: "mod-t", t: "Financeira", d: "52 min", dt: "11 ago", status: "publicado", video: "" },
        { id: "t.dp", moduleId: "mod-t", t: "Desenvolvimento pessoal", d: "41 min", dt: "4 ago", status: "publicado", video: "" },
        { id: "t.ia", moduleId: "mod-t", t: "IA", d: "58 min", dt: "28 jul", status: "publicado", video: "" },
        { id: "a.gro", moduleId: "mod-a", t: "GROWTH", d: "34 min", dt: "20 ago", status: "publicado", video: "" },
        { id: "a.sca", moduleId: "mod-a", t: "SCALE", d: "29 min", dt: "13 ago", status: "publicado", video: "" },
        { id: "m1.1", moduleId: "mod-1", t: "Porquê um nicho", d: "9 min", status: "publicado", video: "" },
        { id: "m1.2", moduleId: "mod-1", t: "Mapear o cliente ideal", d: "14 min", status: "publicado", video: "" },
        { id: "m1.3", moduleId: "mod-1", t: "Auditar a oferta atual", d: "11 min", status: "publicado", video: "" },
        { id: "m1.4", moduleId: "mod-1", t: "Escolher o mercado", d: "8 min", status: "rascunho", video: "" },
        { id: "m2.1", moduleId: "mod-2", t: "Anatomia de uma oferta", d: "12 min", status: "publicado", video: "" },
        { id: "m2.2", moduleId: "mod-2", t: "Ancoragem de valor", d: "16 min", status: "publicado", video: "" },
        { id: "m2.3", moduleId: "mod-2", t: "Definir a tua oferta principal", d: "12 min", status: "publicado", video: "" },
        { id: "m2.4", moduleId: "mod-2", t: "Estrutura de escalões", d: "18 min", status: "rascunho", video: "" },
        { id: "m2.5", moduleId: "mod-2", t: "Quando subir preços", d: "10 min", status: "rascunho", video: "" },
        { id: "m3.1", moduleId: "mod-3", t: "Escolher um canal só", d: "13 min", status: "rascunho", video: "" },
        { id: "m3.2", moduleId: "mod-3", t: "Guião de prospeção fria", d: "21 min", status: "rascunho", video: "" },
        { id: "m3.3", moduleId: "mod-3", t: "Parcerias e referências", d: "15 min", status: "rascunho", video: "" },
        { id: "m4.1", moduleId: "mod-4", t: "A chamada de descoberta", d: "19 min", status: "publicado", video: "" },
        { id: "m4.2", moduleId: "mod-4", t: "Tratar objeções", d: "23 min", status: "rascunho", video: "" }
      ],
      folders: {
        raiz: { id: "raiz", nome: "Documentos", parent: null, pastas: ["p0", "p1", "p2", "p3", "p4", "ppa", "pt"], fich: fileIds([
          { n: "[AT] Mapa de…", t: "gsheet" }, { n: "DICTIONARY", t: "gdoc" }, { n: "Ebook.pdf", t: "pdf" },
          { n: "Framework de…", t: "gdoc" }, { n: "Planilha Controlo…", t: "gsheet" }, { n: "Script de call…", t: "gdoc" }
        ]) },
        p0: { id: "p0", nome: "0 · Alinhamento de expectativas", parent: "raiz", pastas: [], fich: [] },
        p1: { id: "p1", nome: "1 · Identidade do Comunicador", parent: "raiz", pastas: [], fich: fileIds([
          { n: "Clareza e…", t: "doc" }, { n: "Dashboard Diário", t: "xls" }, { n: "Identidade Atual…", t: "doc" },
          { n: "Livro de…", t: "doc" }, { n: "Nova…", t: "doc" }, { n: "Vida de Sonhos", t: "doc" }
        ]) },
        p2: { id: "p2", nome: "2 · Posicionamento", parent: "raiz", pastas: [], fich: fileIds([
          { n: "Calendário de…", t: "xls" }, { n: "Posicionamento", t: "doc" }
        ]) },
        p3: { id: "p3", nome: "3 · Oferta", parent: "raiz", pastas: [], fich: fileIds([
          { n: "Oferta", t: "doc" }, { n: "Transformação", t: "doc" }
        ]) },
        p4: { id: "p4", nome: "4 · Conversão 10X", parent: "raiz", pastas: ["pev"], fich: fileIds([
          { n: "[NBP] Webinar · Ciclos de 7 dias", t: "gsheet" }, { n: "Conversão", t: "doc" }, { n: "Planilha de Evento", t: "gsheet" }
        ]) },
        pev: { id: "pev", nome: "Evento Presencial", parent: "p4", pastas: [], fich: [] },
        ppa: { id: "ppa", nome: "Plano de Ação", parent: "raiz", pastas: [], fich: fileIds([
          { n: "[NBP] MODELO…", t: "xls" }, { n: "[NBP]…", t: "xls" }
        ]) },
        pt: { id: "pt", nome: "Templates", parent: "raiz", pastas: [], fich: [] }
      },
      talks: [
        { id: "tk-1", t: "O preço não é o problema", d: "2026-08-21", m: "11 min", n: "Porque é que baixar o preço quase nunca resolve o que parece resolver.", status: "publicado", featured: true },
        { id: "tk-2", t: "Fazer menos, melhor", d: "2026-08-14", m: "9 min", n: "Sobre escolher um canal e ficar lá tempo suficiente.", status: "publicado", featured: false },
        { id: "tk-3", t: "A conversa que estás a evitar", d: "2026-08-07", m: "14 min", n: "Clientes, sócios, equipa — o custo de adiar.", status: "publicado", featured: false },
        { id: "tk-4", t: "Consistência não é motivação", d: "2026-07-31", m: "8 min", n: "Sistemas em vez de vontade.", status: "arquivo", featured: false }
      ],
      rules: [
        { id: "r-tut", weekday: 2, hour: "18h00", kind: "tutoria", rotation: ["Desenv. pessoal", "Financeira", "Conteúdo", "IA"] },
        { id: "r-acc", weekday: 4, hour: "18h00", kind: "accountability", rotation: ["GROWTH", "SCALE"] }
      ],
      events: [],
      plans: seedRoquePlans()
    };
  }

  function load() {
    try {
      var raw = localStorage.getItem(STORAGE);
      if (!raw) {
        var s = seed();
        save(s);
        return s;
      }
      var data = JSON.parse(raw);
      if (!data) {
        var fresh = seed();
        save(fresh);
        return fresh;
      }
      if (data._v !== VERSION || !data.plans) {
        data = migrate(data);
        save(data);
      }
      return data;
    } catch (e) {
      var fallback = seed();
      save(fallback);
      return fallback;
    }
  }

  function save(data) {
    localStorage.setItem(STORAGE, JSON.stringify(data));
    return data;
  }

  function reset() {
    var s = seed();
    save(s);
    return s;
  }

  function loggedIn() {
    try { return localStorage.getItem(SESSION) === "1"; } catch (e) { return false; }
  }

  function login() {
    localStorage.setItem(SESSION, "1");
  }

  function logout() {
    localStorage.removeItem(SESSION);
  }

  function requireAuth() {
    if (!loggedIn()) {
      window.location.replace("login.html");
    }
  }

  function findById(list, id) {
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return null;
  }

  function lessonsFor(data, moduleId) {
    return data.lessons.filter(function (l) { return l.moduleId === moduleId; });
  }

  function countItems(folder) {
    return (folder.pastas ? folder.pastas.length : 0) + (folder.fich ? folder.fich.length : 0);
  }

  function kindFromRule(rule, label) {
    if (rule.kind === "tutoria") return "tutoria";
    if (label === "SCALE") return "scale";
    return "growth";
  }

  function subFromKind(kind) {
    if (kind === "tutoria") return "Tutoria";
    if (kind === "presencial") return "Presencial";
    return "Accountability";
  }

  function eventsForDate(date, data) {
    var key = ky(date);
    var w = date.getDay();
    var n = Math.floor((date.getDate() - 1) / 7);
    var out = [];

    data.rules.forEach(function (rule) {
      if (rule.weekday !== w) return;
      var cancelled = data.events.some(function (e) {
        return e.type === "cancel" && e.date === key && e.ruleId === rule.id;
      });
      if (cancelled) return;
      var override = null;
      data.events.forEach(function (e) {
        if (e.type === "override" && e.date === key && e.ruleId === rule.id) override = e;
      });
      if (override) {
        out.push({
          id: override.id,
          date: key,
          title: override.title,
          kind: override.kind,
          hour: override.hour || rule.hour,
          sub: subFromKind(override.kind),
          generated: false,
          ruleId: rule.id,
          type: "override"
        });
        return;
      }
      var rot = rule.rotation || [];
      var label = rot.length ? rot[n % rot.length] : (rule.title || "Evento");
      out.push({
        id: "gen-" + rule.id + "-" + key,
        date: key,
        title: label,
        kind: kindFromRule(rule, label),
        hour: rule.hour,
        sub: rule.kind === "tutoria" ? "Tutoria" : "Accountability",
        generated: true,
        ruleId: rule.id,
        type: "generated"
      });
    });

    data.events.forEach(function (e) {
      if (e.type === "oneoff" && e.date === key) {
        out.push({
          id: e.id,
          date: key,
          title: e.title,
          kind: e.kind,
          hour: e.hour || "18h00",
          sub: subFromKind(e.kind),
          generated: false,
          type: "oneoff"
        });
      }
    });
    return out;
  }

  function nextEvent(data, from) {
    var d = new Date(from.getFullYear(), from.getMonth(), from.getDate());
    for (var i = 0; i < 60; i++) {
      var ev = eventsForDate(d, data);
      if (ev.length) return { date: new Date(d.getTime()), event: ev[0] };
      d.setDate(d.getDate() + 1);
    }
    return null;
  }

  function featuredTalk(data) {
    var pub = data.talks.filter(function (t) { return t.status === "publicado"; });
    pub.sort(function (a, b) { return (b.d || "").localeCompare(a.d || ""); });
    var feat = pub.filter(function (t) { return t.featured; });
    return feat[0] || pub[0] || null;
  }

  function formatTalkDate(iso) {
    if (!iso) return "—";
    var p = iso.split("-");
    if (p.length !== 3) return iso;
    var months = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
    var day = parseInt(p[2], 10);
    var mo = parseInt(p[1], 10) - 1;
    return day + " de " + (months[mo] || p[1]);
  }

  function weekdayLabel(n) {
    return ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"][n] || "";
  }

  function toast(msg) {
    var el = document.getElementById("nbpToast");
    if (!el) {
      el = document.createElement("div");
      el.id = "nbpToast";
      el.className = "toast";
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { el.classList.remove("show"); }, 2400);
  }

  function closeModal() {
    var b = document.getElementById("nbpModal");
    if (b) b.classList.remove("show");
  }

  function showModal(opts) {
    var b = document.getElementById("nbpModal");
    if (!b) {
      b = document.createElement("div");
      b.id = "nbpModal";
      b.className = "modal-backdrop";
      b.innerHTML = '<div class="modal" role="dialog"></div>';
      b.addEventListener("click", function (e) {
        if (e.target === b) closeModal();
      });
      document.body.appendChild(b);
    }
    var box = b.querySelector(".modal");
    box.innerHTML =
      "<h3>" + esc(opts.title || "") + "</h3>" +
      (opts.bodyHtml || ("<p>" + esc(opts.body || "") + "</p>")) +
      '<div class="form-actions">' +
        (opts.cancel !== false ? '<button type="button" class="btn btn-ghost" data-act="cancel">' + esc(opts.cancelLabel || "Cancelar") + "</button>" : "") +
        '<button type="button" class="btn ' + (opts.danger ? "btn-danger" : "btn-primary") + '" data-act="ok">' + esc(opts.okLabel || "Confirmar") + "</button>" +
      "</div>";
    b.classList.add("show");
    box.querySelector('[data-act="ok"]').onclick = function () {
      if (opts.onOk) opts.onOk(box);
      else closeModal();
    };
    var c = box.querySelector('[data-act="cancel"]');
    if (c) c.onclick = function () { closeModal(); };
    return box;
  }

  function confirm(msg, onOk) {
    showModal({
      title: "Confirmar",
      body: msg,
      danger: true,
      okLabel: "Confirmar",
      onOk: function () { closeModal(); onOk(); }
    });
  }

  function navItems(active) {
    var items = [
      { id: "index", href: "index.html", ic: "fa-house", lb: "Visão geral" },
      { id: "members", href: "members.html", ic: "fa-users", lb: "Membros" },
      { id: "content", href: "content.html", ic: "fa-file-lines", lb: "Conteúdos" },
      { id: "documents", href: "documents.html", ic: "fa-folder", lb: "Documentos" },
      { id: "talks", href: "talks.html", ic: "fa-microphone-lines", lb: "Mafra Talks" },
      { id: "calendar", href: "calendar.html", ic: "fa-calendar", lb: "Calendário" }
    ];
    return items.map(function (it) {
      return '<a class="nav-item' + (it.id === active ? " active" : "") + '" href="' + it.href + '">' +
        '<i class="fa-solid ' + it.ic + '" aria-hidden="true"></i><span>' + it.lb + "</span></a>";
    }).join("");
  }

  function mountShell(active) {
    var sidebar = document.getElementById("sidebar");
    if (sidebar) {
      sidebar.innerHTML =
        '<div class="sidebar-brand">' +
          '<span class="brand-mark" aria-hidden="true">' +
            '<svg width="17" height="17" viewBox="0 0 20 20" aria-hidden="true"><rect width="20" height="20" fill="#C6CABE"/><circle cx="10" cy="10" r="6.2" fill="#2A2926"/></svg>' +
          "</span>" +
          '<span class="brand-name">NBP</span>' +
        "</div>" +
        '<span class="brand-badge">Backoffice</span>' +
        '<div class="sidebar-profile">' +
          '<div class="profile-avatar">JM</div>' +
          '<div class="profile-info">' +
            '<div class="profile-name">João Mafra</div>' +
            '<span class="profile-plan">Equipa</span>' +
          "</div>" +
        "</div>" +
        '<div class="sidebar-label">Menu</div>' +
        '<nav class="sidebar-nav" aria-label="Menu">' + navItems(active) + "</nav>" +
        '<div class="sidebar-footer">' +
          '<a class="nav-item" href="../index.html" id="nbpLogout">' +
            '<i class="fa-solid fa-arrow-right-from-bracket" aria-hidden="true"></i><span>Sair</span>' +
          "</a>" +
        "</div>";
      var lo = document.getElementById("nbpLogout");
      if (lo) lo.addEventListener("click", function (e) {
        e.preventDefault();
        logout();
        window.location.href = "../index.html";
      });
    }

    var toggle = document.getElementById("mobileToggle");
    var backdrop = document.getElementById("sidebarBackdrop");
    if (toggle && sidebar) {
      toggle.addEventListener("click", function (e) {
        e.stopPropagation();
        sidebar.classList.toggle("open");
        if (backdrop) backdrop.classList.toggle("show", sidebar.classList.contains("open"));
      });
    }
    if (backdrop && sidebar) {
      backdrop.addEventListener("click", function () {
        sidebar.classList.remove("open");
        backdrop.classList.remove("show");
      });
    }
    document.addEventListener("click", function (e) {
      if (window.innerWidth > 860) return;
      if (!sidebar) return;
      if (!sidebar.contains(e.target) && e.target !== toggle && (!backdrop || e.target !== backdrop)) {
        sidebar.classList.remove("open");
        if (backdrop) backdrop.classList.remove("show");
      }
    });
  }

  function param(name) {
    var q = new URLSearchParams(window.location.search);
    return q.get(name);
  }

  global.NBPAdmin = {
    SETORES: SETORES,
    FILE_TYPES: FILE_TYPES,
    MES: MES,
    MAB: MAB,
    DIAS: DIAS,
    CAMPOS: CAMPOS,
    COLS: COLS,
    STAGE_STATUS: STAGE_STATUS,
    uid: uid,
    esc: esc,
    initials: initials,
    ky: ky,
    load: load,
    save: save,
    reset: reset,
    login: login,
    logout: logout,
    loggedIn: loggedIn,
    requireAuth: requireAuth,
    findById: findById,
    lessonsFor: lessonsFor,
    countItems: countItems,
    eventsForDate: eventsForDate,
    nextEvent: nextEvent,
    featuredTalk: featuredTalk,
    formatTalkDate: formatTalkDate,
    weekdayLabel: weekdayLabel,
    toast: toast,
    showModal: showModal,
    closeModal: closeModal,
    confirm: confirm,
    mountShell: mountShell,
    param: param,
    planKey: planKey,
    prevPlanKey: prevPlanKey,
    emptyMonth: emptyMonth,
    getMemberPlan: getMemberPlan,
    fmtMetric: fmtMetric
  };
})(window);
