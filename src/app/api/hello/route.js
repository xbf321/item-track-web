import calculateDistance from '@/lib/calculate-distance';

export const runtime = 'edge';

export async function GET() {
  const diff = calculateDistance('39.49615', '116.7097', '39.49611',  '116.7098');
  return new Response('Hello World' + diff)
}
