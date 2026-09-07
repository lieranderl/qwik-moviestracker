const baseUrl = process.argv[2];
if (!baseUrl)
  throw new Error("Usage: bun run bench:ssr -- https://service.example");

const routes = (
  process.env.SSR_BENCH_ROUTES ||
  "/?lang=en-US,/movie?lang=en-US,/tv?lang=en-US"
)
  .split(",")
  .map((route) => route.trim())
  .filter(Boolean);
const samples = Math.max(5, Number(process.env.SSR_BENCH_SAMPLES || 30));
const cookie = process.env.SSR_BENCH_COOKIE;

const percentile = (values, fraction) => {
  const sorted = [...values].sort((left, right) => left - right);
  return sorted[
    Math.min(sorted.length - 1, Math.ceil(sorted.length * fraction) - 1)
  ];
};

const measure = async (route) => {
  const durations = [];
  let failures = 0;
  for (let index = 0; index < samples; index += 1) {
    const startedAt = performance.now();
    const response = await fetch(new URL(route, baseUrl), {
      headers: cookie ? { cookie } : undefined,
      redirect: "manual",
    });
    await response.arrayBuffer();
    durations.push(performance.now() - startedAt);
    if (response.status >= 500) failures += 1;
  }
  return {
    route,
    samples,
    p50Ms: Number(percentile(durations, 0.5).toFixed(1)),
    p95Ms: Number(percentile(durations, 0.95).toFixed(1)),
    p99Ms: Number(percentile(durations, 0.99).toFixed(1)),
    fiveXx: failures,
  };
};

const results = [];
for (const route of routes) results.push(await measure(route));
console.log(
  JSON.stringify(
    { measuredAt: new Date().toISOString(), baseUrl, results },
    null,
    2,
  ),
);
