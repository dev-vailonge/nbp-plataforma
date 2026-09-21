# NBP Design System

Sistema visual do portal e backoffice No Blank Page. Fonte de verdade visual: `legacy/*V2.html` e `legacy/nbp-portal.html`.

- **Tokens TS:** `src/design-system/tokens.ts`
- **Tokens CSS / Tailwind:** `src/app/globals.css` (`@theme`)
- **Showcase vivo:** [/app/design-system](http://localhost:3000/app/design-system)

---

## Princípios

1. **Portal shell** — app num cartão `sup` (max 1180px) sobre `bg`, rail escuro à esquerda.
2. **Superfícies em camadas** — `bg` → `sup` → `sup2` / `fill`; nunca “cards brancos”.
3. **Sálvia como acento** — `#C6CABE` para marca, CTAs e progresso; violeta só para sessões 1:1.
4. **Tipografia de sistema** — stack sans nativa; kickers em uppercase + tracking largo.
5. **Bordas finas** — `0.5px` / `1px` em `bd` / `bd2`; cantos 10–18px (não full-pill em painéis).
6. **Links em fundo claro** — `a { color: inherit }` é global; CTAs claros usam `!text-nbp-ink`.

---

## Cor

| Token | Hex | Uso |
|-------|-----|-----|
| `nbp-bg` | `#111110` | Fundo da página |
| `nbp-sup` | `#1A1A18` | Shell / cards V2 |
| `nbp-sup2` | `#201F1D` | Elevação, inputs |
| `nbp-fill` | `#2A2926` | Nav ativo, wells |
| `nbp-rail` | `#161615` | Sidebar |
| `nbp-bd` / `bd2` | `#302F2C` / `#45443F` | Bordas |
| `nbp-tx` / `tx2` / `tx3` | cream → muted | Texto |
| `nbp-salvia` | `#C6CABE` | Marca / acento |
| `nbp-cream` / `ink` | `#FDFFEF` / `#181818` | CTAs invertidos |
| `nbp-violet*` | família | Sessões 1:1 |
| `nbp-success` / `warn` / `down` / `info` | semânticos | Estados |

Tailwind: `bg-nbp-sup`, `text-nbp-tx2`, `border-nbp-bd`, …

---

## Tipografia

| Papel | Tamanho | Peso | Classe típica |
|-------|---------|------|----------------|
| Page title | 1.4rem | 600 | `PageHeader` |
| Greet | clamp 1.5–2rem | 500 | home |
| Section | 1.05–1.15rem | 600 | painéis |
| Body | ~0.92rem | 400 | — |
| Kicker | 0.68rem | 500 | `SectionLabel` |
| Base HTML | 14.5px | — | `globals.css` |

---

## Espaço e raio

- Escala de espaço: 4 / 8 / 12 / 16 / 20 / 24 / 28 / 32 / 40 / 48
- Raios: `nbp-sm` 7 · `md` 10 · `lg` 12 · `xl` 14 · `2xl` 16 · `3xl` 18 · pill 999
- Shell padding exterior: 22px · sidebar: 200px · content: ~24px

---

## Componentes

### Layout
- `AppShell` — frame portal/admin
- `Sidebar` + `BrandMark` / `StageMark`
- `PageHeader` — título + subtítulo V2
- `SectionLabel` — kicker uppercase
- `Panel` — `surface`: `elev` | `card` | `session` | `violet`; `radius`: `lg` | `xl` | `2xl` | `3xl`; `padding`: `none` | `sm` | `md` | `lg`
- `PanelHead` — título de secção + link opcional

### Acções
- `Button` / `ButtonLink` — `primary` | `solid` | `ghost` | `outline` | `violet` | `danger`
  - sizes: `sm` | `md` | `lg` | `pill`
- `Input` / `TextArea` / `Field` + `fieldControlClass`
- `ProgressBar`

### Identidade
- `Avatar` — tones `sage` | `fill` | `mentor` | `violet`
- `IconWell` — ícone em well gradient
- `Pill` / `PlanBadge`
- `EmptyState`

### Domínio (já existentes)
- `PlanJourney`, `RevenueChart`, `ConteudosView`, `ComunidadeView`, `ActionPlanView`, …

As páginas do portal (`/app/*`) e do admin usam estes primitives. Showcase de referência: `/app/design-system`.

---

## Padrões de página

```tsx
<>
  <PageHeader title="…" subtitle="…" />
  <SectionLabel>Ações rápidas</SectionLabel>
  <Panel surface="card">…</Panel>
</>
```

**Próxima sessão 1:1** — sempre família violeta (`violet-deep` / `violet` / `violet-bd`), nunca sálvia.

**Áudio / Talks** — barra lateral cream→sálvia; play em gradiente cream.

**Canais (Comunidade)** — lista `rail` + chat `sup`; badges unread em sálvia.

---

## Como evoluir

1. Novo token → `tokens.ts` **e** `@theme` em `globals.css`.
2. Novo padrão repetido 2+ vezes → primitive em `src/components/`.
3. Actualizar showcase em `/app/design-system`.
4. Não inventar roxo genérico / cream terracotta / Inter — manter a linguagem NBP.
