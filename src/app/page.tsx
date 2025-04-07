import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="relative flex place-items-center z-[-1]">
        <div className="font-bold text-4xl mb-8 text-center">
          AMS Official
          <div className="text-lg font-normal mt-2">Visa Administration System</div>
        </div>
      </div>

      <div className="mb-32 grid text-center lg:max-w-5xl lg:w-full lg:grid-cols-3 lg:text-left">
        <Link
          href="/dashboard/reviewer"
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100"
        >
          <h2 className="mb-3 text-2xl font-semibold">
            Official Review Page{' '}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              &rarr;
            </span>
          </h2>
          <p className="m-0 max-w-[30ch] text-sm opacity-50">
            Review and process visa applications as an official
          </p>
        </Link>
      </div>
    </main>
  );
}