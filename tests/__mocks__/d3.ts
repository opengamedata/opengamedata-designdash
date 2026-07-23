/** Minimal d3 stub for Jest (avoids ESM transform issues). */
const d3 = {
  select: () => ({
    selectAll: () => ({ remove: () => undefined }),
    append: () => ({
      attr: () => ({ attr: () => ({ style: () => ({}) }) }),
      style: () => ({}),
      text: () => ({}),
      call: () => ({}),
      on: () => ({}),
      data: () => ({ enter: () => ({ append: () => ({}) }) }),
    }),
    attr: () => ({}),
    style: () => ({}),
    html: () => ({}),
    node: () => null,
  }),
  scaleLinear: () => {
    const scale = (v: number) => v;
    scale.domain = () => scale;
    scale.range = () => scale;
    scale.nice = () => scale;
    scale.ticks = () => [];
    return scale;
  },
  scaleBand: () => {
    const scale = (v: string) => 0;
    scale.domain = () => scale;
    scale.range = () => scale;
    scale.padding = () => scale;
    scale.bandwidth = () => 0;
    return scale;
  },
  scaleOrdinal: () => {
    const scale = (v: string) => '#000';
    scale.domain = () => scale;
    scale.range = () => scale;
    return scale;
  },
  axisBottom: () => () => undefined,
  axisLeft: () => () => undefined,
  max: () => 0,
  min: () => 0,
  extent: () => [0, 1],
  bin: () => {
    const b = () => [];
    b.domain = () => b;
    b.thresholds = () => b;
    return b;
  },
  rollup: () => new Map(),
  group: () => new Map(),
  mean: () => 0,
  median: () => 0,
  quantile: () => 0,
  deviation: () => 0,
  format: () => (v: number) => String(v),
  timeFormat: () => (d: Date) => String(d),
  csvParse: () => [],
  tsvParse: () => [],
};

export default d3;
export = d3;
