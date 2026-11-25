(() => {
  const api = globalThis.YSA_RULES;
  if (!api || api.__ysaStructuredCompat) return;
  const original = api.solveStructured;
  const baseValue = (digits, base) => {
    const n = parseInt(digits, base);
    return Number.isSafeInteger(n) ? String(n) : null;
  };
  const evaluate = expression => {
    const normalized = String(expression || "")
      .replace(/([0-9a-f]+)([₀-₉]+)/gi, (_, digits, sub) => {
        const base = Number([...sub].map(c => c.charCodeAt(0) - 0x2080).join(""));
        return base >= 2 && base <= 16 ? (baseValue(digits, base) ?? "NaN") : "NaN";
      })
      .replace(/([0-9a-f]+)_(\d+)/gi, (_, digits, b) => {
        const base = Number(b);
        return base >= 2 && base <= 16 ? (baseValue(digits, base) ?? "NaN") : "NaN";
      })
      .replace(/[×·]/g, "*").replace(/[−–]/g, "-");
    return api.evalExpr(normalized);
  };
  api.solveStructured = raw => {
    const text = String(raw || "");
    if (/даны три арифметическ|вычисли каждое выражение/i.test(text)) {
      const values = {};
      const re = /\b([ABC])\s*=\s*([\s\S]*?)\s*=\s*[-+]?\d+(?=\s*(?:;|\n|$))/gi;
      for (const match of text.matchAll(re)) {
        const value = evaluate(match[2]);
        if (value === null) return null;
        values[match[1].toUpperCase()] = value;
      }
      if (values.A !== undefined && values.B !== undefined && values.C !== undefined) {
        const a = Number(values.A), b = Number(values.B), c = Number(values.C);
        const cmp = (x, y) => x > y ? ">" : x < y ? "<" : "=";
        return [values.A, values.B, values.C, cmp(a, b), cmp(b, c), cmp(a, c)];
      }
    }
    return original(raw);
  };
  api.__ysaStructuredCompat = true;
})();