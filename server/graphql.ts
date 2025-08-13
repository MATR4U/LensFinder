import { GraphQLObjectType, GraphQLSchema, GraphQLString, GraphQLFloat, GraphQLBoolean, GraphQLList, GraphQLNonNull, GraphQLInputObjectType } from 'graphql';
import { getAllCameras, getAllLenses } from './db/provider.js';
import { load } from 'cheerio';

const SensorType = new GraphQLObjectType({
  name: 'Sensor',
  fields: {
    name: { type: GraphQLString },
    width_mm: { type: GraphQLFloat },
    height_mm: { type: GraphQLFloat },
    coc_mm: { type: GraphQLFloat },
    crop: { type: GraphQLFloat }
  }
});

const CameraType = new GraphQLObjectType({
  name: 'Camera',
  fields: {
    name: { type: GraphQLString },
    brand: { type: GraphQLString },
    mount: { type: GraphQLString },
    sensor: { type: SensorType },
    ibis: { type: GraphQLBoolean },
    price_chf: { type: GraphQLFloat },
    weight_g: { type: GraphQLFloat },
    source_url: { type: GraphQLString }
  }
});

const LensType = new GraphQLObjectType({
  name: 'Lens',
  fields: {
    name: { type: GraphQLString },
    brand: { type: GraphQLString },
    mount: { type: GraphQLString },
    coverage: { type: GraphQLString },
    focal_min_mm: { type: GraphQLFloat },
    focal_max_mm: { type: GraphQLFloat },
    aperture_min: { type: GraphQLFloat },
    aperture_max: { type: GraphQLFloat },
    weight_g: { type: GraphQLFloat },
    ois: { type: GraphQLBoolean },
    price_chf: { type: GraphQLFloat },
    weather_sealed: { type: GraphQLBoolean },
    is_macro: { type: GraphQLBoolean },
    distortion_pct: { type: GraphQLFloat },
    focus_breathing_score: { type: GraphQLFloat },
    source_url: { type: GraphQLString }
  }
});

const ReportItemInput = new GraphQLInputObjectType({
  name: 'ReportItemInput',
  fields: {
    name: { type: new GraphQLNonNull(GraphQLString) },
    total: { type: new GraphQLNonNull(GraphQLFloat) },
    weight_g: { type: new GraphQLNonNull(GraphQLFloat) },
    price_chf: { type: new GraphQLNonNull(GraphQLFloat) },
    type: { type: new GraphQLNonNull(GraphQLString) }
  }
});

const ReportVerdictType = new GraphQLObjectType({
  name: 'ReportVerdict',
  fields: {
    label: { type: GraphQLString },
    name: { type: GraphQLString }
  }
});

const ReportItemType = new GraphQLObjectType({
  name: 'ReportItem',
  fields: {
    rank: { type: GraphQLFloat },
    name: { type: GraphQLString },
    score: { type: GraphQLFloat },
    type: { type: GraphQLString },
    weight_g: { type: GraphQLFloat },
    price_chf: { type: GraphQLFloat }
  }
});

const ReportType = new GraphQLObjectType({
  name: 'Report',
  fields: {
    cameraName: { type: GraphQLString },
    goal: { type: GraphQLString },
    items: { type: new GraphQLList(ReportItemType) },
    verdicts: { type: new GraphQLList(ReportVerdictType) },
    summary: { type: GraphQLString }
  }
});

function normalizePriceFromHtml(html: string): string | null {
  const $ = load(html);
  const candidates = [
    $('[itemprop="price"]').attr('content'),
    $('[data-price]').attr('data-price'),
    $('[class*="price" i]').first().text(),
    $('meta[property="product:price:amount"]').attr('content')
  ].filter(Boolean) as string[];
  const raw = candidates.find(Boolean) || '';
  const match = raw.replace(/\s+/g, ' ').match(/([\d'.,]+)\s*(CHF|EUR|USD)?/i);
  return match ? `${match[2] ? match[2].toUpperCase() + ' ' : ''}${match[1]}` : null;
}

const QueryType = new GraphQLObjectType({
  name: 'Query',
  fields: {
    cameras: {
      type: new GraphQLList(CameraType),
      resolve: async () => {
        const rows = await getAllCameras();
        return rows.map((r) => ({
          name: r.name,
          brand: r.brand,
          mount: r.mount,
          sensor: {
            name: r.sensor_name,
            width_mm: r.sensor_width_mm,
            height_mm: r.sensor_height_mm,
            coc_mm: r.sensor_coc_mm,
            crop: r.sensor_crop
          },
          ibis: !!r.ibis,
          price_chf: r.price_chf as any,
          weight_g: r.weight_g as any,
          source_url: r.source_url
        }));
      }
    },
    lenses: {
      type: new GraphQLList(LensType),
      resolve: async () => {
        const rows = await getAllLenses();
        return rows.map((r) => ({
          name: r.name,
          brand: r.brand,
          mount: r.mount,
          coverage: r.coverage,
          focal_min_mm: r.focal_min_mm as any,
          focal_max_mm: r.focal_max_mm as any,
          aperture_min: r.aperture_min as any,
          aperture_max: r.aperture_max as any,
          weight_g: r.weight_g as any,
          ois: !!r.ois,
          price_chf: r.price_chf as any,
          weather_sealed: !!r.weather_sealed,
          is_macro: !!r.is_macro,
          distortion_pct: r.distortion_pct as any,
          focus_breathing_score: r.focus_breathing_score as any,
          source_url: r.source_url
        }));
      }
    },
    price: {
      type: GraphQLString,
      args: { url: { type: new GraphQLNonNull(GraphQLString) } },
      resolve: async (_src, { url }: { url: string }) => {
        const resp = await fetch(url);
        const html = await resp.text();
        return normalizePriceFromHtml(html);
      }
    }
  }
});

const MutationType = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    report: {
      type: ReportType,
      args: {
        cameraName: { type: new GraphQLNonNull(GraphQLString) },
        goal: { type: new GraphQLNonNull(GraphQLString) },
        top: { type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(ReportItemInput))) }
      },
      resolve: (_src, { cameraName, goal, top }: any) => {
        if (!top || top.length === 0) {
          return { cameraName, goal, items: [], verdicts: [], summary: 'No results to analyze.' };
        }
        const items = top.map((t: any, i: number) => ({
          rank: i + 1,
          name: t.name,
          score: Math.round(t.total),
          type: t.type,
          weight_g: t.weight_g,
          price_chf: t.price_chf
        }));
        const verdicts = [
          { label: 'Ultimate performance', name: top[0].name },
          { label: 'Best all-rounder', name: top[1] ? top[1].name : top[0].name },
          { label: 'Portability/value', name: top[2] ? top[2].name : top[0].name }
        ];
        return { cameraName, goal, items, verdicts };
      }
    }
  }
});

export const schema = new GraphQLSchema({ query: QueryType, mutation: MutationType });


