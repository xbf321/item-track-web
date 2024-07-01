import AMap from '@/app/_components/amap';
import GetCoordinateListData from '@/data/coordinate-list';

export const runtime = 'edge'

export default async function Home() {
  // deviceId: 868655073671168
  const { endPoint, lines } = await GetCoordinateListData();
  return (
    <main className="flex flex-col">
      <AMap lines={lines} endPoint={endPoint} />
    </main>
  );
}
