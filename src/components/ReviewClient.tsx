"use client";

import { useEffect, useState } from "react";
import { useServerMutation } from "@/hooks/use-server-mutation";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { Field, Input, Select } from "@/components/ui/Field";
import { Badge } from "@/components/ui/Badge";
import { Timeline, TimelineItem } from "@/components/ui/Timeline";
import { Hairline } from "@/components/ui/Hairline";

export function ReviewClient({
  logs,
  collapses,
  wins,
  precedents,
}: {
  logs: { id: string; type: string; payload: string; createdAt: string }[];
  collapses: {
    reasonTag: string;
    notes: string | null;
    createdAt: string;
    node: { policy: { title: string } };
  }[];
  wins: { date: string; dayName: string | null; winLevel: string | null }[];
  precedents: {
    scopeType: string;
    behaviorKey: string;
    description: string | null;
    allowedAt: string;
  }[];
}) {
  const { mutate } = useServerMutation();
  const [dayName, setDayName] = useState("");
  const [winLevel, setWinLevel] = useState("中赢");
  const [winList, setWinList] = useState(wins);
  useEffect(() => setWinList(wins), [wins]);

  async function saveWin() {
    if (!dayName.trim()) return;
    const today = new Date().toISOString().slice(0, 10);
    const entry = { date: today, dayName: dayName.trim(), winLevel };
    setWinList((prev) => [entry, ...prev.filter((w) => w.date !== today)]);
    setDayName("");
    await mutate({
      url: "/api/daily-wins",
      init: {
        method: "POST",
        body: {
          entries: [{ text: entry.dayName, level: winLevel }],
          dayName: entry.dayName,
          winLevel,
        },
      },
    });
  }

  return (
    <div className="space-y-10 max-w-[68ch]">
      <section>
        <h2 className="font-serif text-xl mb-4">赢麻了</h2>
        <Card className="mb-6">
          <CardBody className="space-y-4">
            <Field label="命名今日（最大喜报）">
              <Input
                value={dayName}
                onChange={(e) => setDayName(e.target.value)}
                placeholder="炖鸡汤大成功日"
              />
            </Field>
            <Field label="定级">
              <Select value={winLevel} onChange={(e) => setWinLevel(e.target.value)}>
                <option>小赢</option>
                <option>中赢</option>
                <option>大赢</option>
              </Select>
            </Field>
            <Button onClick={saveWin}>保存</Button>
          </CardBody>
        </Card>
        <ul className="space-y-4">
          {winList.map((w) => (
            <li key={w.date}>
              <Card>
                <CardBody>
                  <p className="font-data text-xs text-ink-muted">{w.date}</p>
                  <p className="font-serif text-2xl italic text-ink mt-1">
                    {w.dayName ?? "—"}
                  </p>
                  {w.winLevel && (
                    <Badge variant="success" className="mt-2">
                      {w.winLevel}
                    </Badge>
                  )}
                </CardBody>
              </Card>
            </li>
          ))}
        </ul>
      </section>

      <Hairline />

      <section>
        <h2 className="font-serif text-xl mb-4">崩塌记录</h2>
        {collapses.length === 0 ? (
          <p className="text-sm text-ink-muted">暂无崩塌记录</p>
        ) : (
          <Timeline>
            {collapses.map((c, i) => (
              <TimelineItem
                key={i}
                title={c.node.policy.title}
                meta={new Date(c.createdAt).toLocaleDateString("zh-CN")}
              >
                <Badge variant="outline">{c.reasonTag}</Badge>
                {c.notes && <p className="mt-1">{c.notes}</p>}
              </TimelineItem>
            ))}
          </Timeline>
        )}
      </section>

      <section>
        <h2 className="font-serif text-xl mb-4">判例库</h2>
        <ul className="space-y-2">
          {precedents.map((p, i) => (
            <li
              key={i}
              className="text-sm panel-border rounded-sm px-4 py-3 bg-panel font-data"
            >
              <span className="text-accent">[{p.scopeType}]</span> {p.behaviorKey}
              {p.description && (
                <span className="block text-ink-muted mt-1 font-sans">
                  {p.description}
                </span>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="font-serif text-xl mb-4">事件日志</h2>
        <Timeline>
          {logs.map((l) => (
            <TimelineItem
              key={l.id}
              title={l.type}
              meta={new Date(l.createdAt).toLocaleString("zh-CN")}
            />
          ))}
        </Timeline>
      </section>
    </div>
  );
}
