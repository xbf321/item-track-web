import AMap from '@/app/_components/amap';
import GetCoordinateListData from '@/data/coordinate-list';

export const runtime = 'edge'

export default async function Home() {
  const { endPoint, lines } = await GetCoordinateListData(868655073671168);
  return (
    <main className="flex flex-col">
      <AMap lines={lines} endPoint={endPoint} />
    </main>
  );
}
