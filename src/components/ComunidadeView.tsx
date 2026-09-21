"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Fa } from "@/components/BrandMark";
import { PageHeader } from "@/components/Panel";
import { Input } from "@/components/ui";
import {
  COMM_MESSAGES_SEED,
  COMM_UNREAD_SEED,
  type CommMessage,
  type CommRole,
  commAvatarTone,
  commInitials,
  commSectionsForRole,
  commTopicFor,
} from "@/lib/mocks";

function UnreadBadge({ n }: { n: number }) {
  if (!n) return null;
  return (
    <span className="rounded-lg bg-nbp-salvia px-[5px] font-mono text-[9.5px] text-[#1A1A18]">
      {n}
    </span>
  );
}

export function ComunidadeView() {
  const [role, setRole] = useState<CommRole>("cliente");
  const [active, setActive] = useState("wins");
  const [query, setQuery] = useState("");
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [unread, setUnread] = useState<Record<string, number>>(() => ({
    ...COMM_UNREAD_SEED,
  }));
  const [messages, setMessages] = useState<Record<string, CommMessage[]>>(() => {
    const copy: Record<string, CommMessage[]> = {};
    for (const [k, v] of Object.entries(COMM_MESSAGES_SEED)) {
      copy[k] = v.map((m) => [...m] as CommMessage);
    }
    return copy;
  });
  const [draft, setDraft] = useState("");
  const [typing, setTyping] = useState("");
  const msgsRef = useRef<HTMLDivElement>(null);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const sections = useMemo(() => commSectionsForRole(role), [role]);
  const q = query.trim().toLowerCase();

  const visibleChannels = useMemo(() => {
    const all: string[] = [];
    sections.forEach((s) => s.channels.forEach((c) => all.push(c)));
    return all;
  }, [sections]);

  useEffect(() => {
    if (!visibleChannels.includes(active)) {
      setActive(visibleChannels[0] ?? "wins");
    }
  }, [visibleChannels, active]);

  useEffect(() => {
    const el = msgsRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [active, messages, typing]);

  useEffect(() => {
    return () => {
      if (typingTimer.current) clearTimeout(typingTimer.current);
    };
  }, []);

  const isExt = active.startsWith("ext-");
  const isInt = active.startsWith("int-") || active === "team-availability";
  const channelMsgs = messages[active] ?? [];

  function selectChannel(id: string) {
    setActive(id);
    setUnread((u) => {
      if (!u[id]) return u;
      const next = { ...u };
      delete next[id];
      return next;
    });
    setTyping("");
    setDraft("");
  }

  function send() {
    const v = draft.trim();
    if (!v) return;
    setMessages((prev) => ({
      ...prev,
      [active]: [...(prev[active] ?? []), ["Tu", v]],
    }));
    setDraft("");
    const quem = active.startsWith("int-") ? "Gustavo" : "João Mafra";
    setTyping(`${quem} está a escrever…`);
    if (typingTimer.current) clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      setMessages((prev) => ({
        ...prev,
        [active]: [
          ...(prev[active] ?? []),
          [quem, "Anotado. Falamos nisso na próxima sessão."],
        ],
      }));
      setTyping("");
    }, 1700);
  }

  return (
    <section className="w-full" aria-label="Comunidade">
      <div className="mb-3.5 flex flex-wrap items-end justify-between gap-3">
        <PageHeader
          title="Comunidade"
          subtitle={
            role === "cliente"
              ? "Os canais de grupo e o teu canal privado com a equipa."
              : "Todos os canais, agrupados por consultor."
          }
          className="mb-0"
        />
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-nbp-tx3">a ver como</span>
          <div className="flex overflow-hidden rounded-[7px] border-[0.5px] border-nbp-bd">
            {(
              [
                ["cliente", "Cliente"],
                ["equipa", "Equipa"],
              ] as const
            ).map(([id, label], i) => {
              const on = role === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setRole(id)}
                  className={`cursor-pointer border-0 px-[11px] py-[5px] text-[12px] ${
                    i === 1 ? "border-l-[0.5px] border-nbp-bd" : ""
                  } ${on ? "bg-nbp-fill text-nbp-tx" : "bg-transparent text-nbp-tx2"}`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex h-[480px] gap-0 overflow-hidden rounded-[11px] border-[0.5px] border-nbp-bd max-[860px]:h-auto max-[860px]:min-h-[520px] max-[860px]:flex-col">
        {/* Channel list */}
        <div className="flex w-[224px] shrink-0 flex-col border-r-[0.5px] border-nbp-bd bg-[#161615] max-[860px]:w-full max-[860px]:max-h-[220px] max-[860px]:border-r-0 max-[860px]:border-b-[0.5px]">
          <div className="relative flex items-center border-b-[0.5px] border-nbp-bd px-[11px] py-3">
            <Fa
              name="fa-magnifying-glass"
              className="pointer-events-none absolute left-5 text-[14px] text-nbp-tx3"
            />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Encontrar um canal"
              aria-label="Encontrar um canal"
              className="!h-[30px] !rounded-[7px] !py-0 !pr-[9px] !pl-[30px] !text-[12px]"
            />
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {sections.map((sec) => {
              const filtered = sec.channels.filter(
                (c) => !q || c.toLowerCase().includes(q),
              );
              if (!filtered.length) return null;
              const isCollapsed = Boolean(collapsed[sec.id]) && !q;
              const sectionUnread = sec.channels.reduce(
                (a, c) => a + (unread[c] || 0),
                0,
              );
              return (
                <div key={sec.id}>
                  <button
                    type="button"
                    onClick={() =>
                      setCollapsed((prev) => ({
                        ...prev,
                        [sec.id]: !prev[sec.id],
                      }))
                    }
                    className="mt-[7px] flex w-full cursor-pointer items-center gap-[7px] rounded-md border-0 bg-transparent px-[7px] py-[5px] text-left text-[11px] tracking-[0.03em] text-nbp-tx2 uppercase"
                  >
                    <span
                      className="inline-block w-2 text-[9px] transition-transform"
                      style={{
                        transform: isCollapsed ? "rotate(-90deg)" : "none",
                      }}
                    >
                      ▾
                    </span>
                    <span
                      className="h-[7px] w-[7px] shrink-0 rounded-sm"
                      style={{ background: sec.color }}
                    />
                    <span className="min-w-0 flex-1 truncate">{sec.name}</span>
                    <span className="font-mono text-[10px] text-[#5C5B55] normal-case">
                      {filtered.length}
                    </span>
                    {isCollapsed && sectionUnread ? (
                      <UnreadBadge n={sectionUnread} />
                    ) : null}
                  </button>
                  {!isCollapsed
                    ? filtered.map((c) => {
                        const on = c === active;
                        const u = unread[c] || 0;
                        return (
                          <button
                            key={c}
                            type="button"
                            onClick={() => selectChannel(c)}
                            className={`flex w-full cursor-pointer items-center gap-[7px] rounded-md border-0 py-1 pr-2 pl-[22px] text-left text-[12.5px] ${
                              on ? "bg-nbp-fill" : "bg-transparent"
                            } ${on || u ? "text-nbp-tx" : "text-nbp-tx2"}`}
                          >
                            <Fa name="fa-lock" className="text-[11px] text-[#6E6C65]" />
                            <span
                              className={`min-w-0 flex-1 truncate ${u ? "font-semibold" : ""}`}
                            >
                              {c}
                            </span>
                            <UnreadBadge n={u} />
                          </button>
                        );
                      })
                    : null}
                </div>
              );
            })}
            {!sections.some((s) =>
              s.channels.some((c) => !q || c.toLowerCase().includes(q)),
            ) ? (
              <p className="px-2 py-3.5 text-[12px] text-nbp-tx3">
                Nenhum canal com “{query}”.
              </p>
            ) : null}
          </div>
        </div>

        {/* Chat pane */}
        <div className="flex min-w-0 flex-1 flex-col px-4 pt-3.5 pb-4">
          <div className="mb-[13px] border-b-[0.5px] border-nbp-bd pb-[11px]">
            <p className="m-0 flex flex-wrap items-center text-[15px] font-medium text-nbp-tx">
              <span className="mr-1 text-[#6E6C65]">#</span>
              {active}
              {isInt ? (
                <span className="ml-[9px] rounded-[7px] bg-[#33260F] px-2 py-0.5 text-[10.5px] text-[#E0AC5E]">
                  só equipa
                </span>
              ) : null}
              {isExt ? (
                <span className="ml-[9px] rounded-[7px] bg-[#16293D] px-2 py-0.5 text-[10.5px] text-[#8FBEEA]">
                  privado
                </span>
              ) : null}
            </p>
            <p className="mt-1 mb-0 text-[11.5px] text-nbp-tx2">{commTopicFor(active)}</p>
          </div>

          <div ref={msgsRef} className="flex-1 overflow-y-auto pr-1.5">
            {channelMsgs.length ? (
              channelMsgs.map((m, i) => {
                const joined = i > 0 && channelMsgs[i - 1][0] === m[0];
                return (
                  <div
                    key={`${active}-${i}-${m[0]}`}
                    className={`flex gap-[9px] ${joined ? "mb-[3px]" : "mb-3"}`}
                  >
                    {joined ? (
                      <span className="w-7 shrink-0" />
                    ) : (
                      <span
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[7px] text-[10.5px] text-[#D8D6CE]"
                        style={{ background: commAvatarTone(m[0]) }}
                      >
                        {commInitials(m[0])}
                      </span>
                    )}
                    <div className="min-w-0">
                      {!joined ? (
                        <p className="mt-0 mb-0.5 text-[12px] font-medium text-nbp-tx">
                          {m[0]}
                        </p>
                      ) : null}
                      <p className="m-0 text-[13px] leading-[1.55] text-[#D6D4CC]">{m[1]}</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="py-5 text-[12.5px] text-nbp-tx3">
                Ainda ninguém escreveu em #{active}.
              </p>
            )}
          </div>

          <p className="my-[5px] h-4 text-[11.5px] text-nbp-tx3">{typing || "\u00a0"}</p>

          <div className="flex gap-1.5">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") send();
              }}
              placeholder={`Mensagem para #${active}`}
              aria-label="Mensagem"
              className="h-9 flex-1 rounded-lg border-[0.5px] border-nbp-bd bg-nbp-sup2 px-[11px] font-[inherit] text-[13px] text-nbp-tx outline-none"
            />
            <button
              type="button"
              onClick={send}
              aria-label="Enviar"
              className="flex cursor-pointer items-center rounded-lg border-[0.5px] border-nbp-bd bg-nbp-sup2 px-3 text-nbp-tx"
            >
              <Fa name="fa-paper-plane" className="text-[16px]" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
