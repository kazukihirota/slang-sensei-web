export default function DevNotice() {
  if (!import.meta.env.DEV) return null;

  return (
    <div className='mt-6 bg-blue-50 border border-blue-200 rounded-lg p-3'>
      <p className='text-blue-700 text-xs text-center'>
        <span className='font-medium'>Dev Mode:</span> Check emails at{' '}
        <a
          href='http://127.0.0.1:54324'
          target='_blank'
          rel='noopener noreferrer'
          className='underline hover:text-blue-900'
        >
          localhost:54324
        </a>
      </p>
    </div>
  );
}
