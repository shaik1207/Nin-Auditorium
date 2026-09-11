export default function Analytics() {
  return (
    <div>

      <h1 className="text-5xl font-bold">
        Analytics
      </h1>

      <p className="text-gray-600 mt-3">
        Booking statistics and reports.
      </p>

      <div className="grid grid-cols-3 gap-5 mt-10">

        <div className="bg-white/40 backdrop-blur-lg rounded-3xl p-6">
          <p>Total Bookings</p>
          <h2 className="text-5xl font-bold mt-3">120</h2>
        </div>

        <div className="bg-white/40 backdrop-blur-lg rounded-3xl p-6">
          <p>Approved</p>
          <h2 className="text-5xl font-bold mt-3">98</h2>
        </div>

        <div className="bg-white/40 backdrop-blur-lg rounded-3xl p-6">
          <p>Rejected</p>
          <h2 className="text-5xl font-bold mt-3">22</h2>
        </div>

      </div>

    </div>
  );
}