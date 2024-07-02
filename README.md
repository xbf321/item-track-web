物品丢失定位系统

## 背景

## Getting Started

First, create local database if it not exists.

```bash
npx wrangler d1 execute item-track-db --file=./db-schema.sql
```

then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## D1

list from local db

```bash
npx wrangler d1 execute item-track-db --local --command="SELECT * FROM records"
```

### Deploy Database

```bash
npx wrangler d1 execute item-track-db --remote --file=./db-schema.sql
```

## Deploy Pages

```bash
npm run deploy
```

## 文档

[地图纠偏](https://old.openluat.com/GPS-Offset.html)

[Air780说明](https://yinerda.yuque.com/yt1fh6/4gdtu/gsccog81mv0hpii7#K9Gdv)

[高德地图文档](https://lbs.amap.com/demo/javascript-api-v2/example/map-lifecycle/loader)

[Nextjs](https://nextjs.org/docs/getting-started/installation)
