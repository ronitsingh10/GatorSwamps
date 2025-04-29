const Skeleton = () => {
  return (
    <section className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-7xl mb-14">
        {/* Property Header Skeleton */}
        <div className="flex flex-col gap-4 mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="h-8 bg-gray-200 rounded-md w-3/4 animate-pulse mb-2"></div>
              <div className="h-4 bg-gray-200 rounded-md w-1/2 animate-pulse mb-2"></div>
            </div>
            <div className="h-8 bg-gray-200 rounded-md w-32 animate-pulse"></div>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="h-6 bg-gray-200 rounded-full w-20 animate-pulse"></div>
            <div className="h-6 bg-gray-200 rounded-full w-24 animate-pulse"></div>
          </div>
        </div>

        {/* Main Content Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Column Skeleton */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              {/* Image Carousel Skeleton */}
              <div className="w-full h-64 sm:h-80 md:h-96 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>

            <div className="flex gap-x-6 text-neutral-600 mb-6">
              <div className="flex gap-x-2 items-center">
                <div className="w-6 h-6 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="w-4 h-4 bg-gray-200 rounded-md animate-pulse"></div>
              </div>
              <div className="flex gap-x-2 items-center">
                <div className="w-6 h-6 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="w-4 h-4 bg-gray-200 rounded-md animate-pulse"></div>
              </div>
              <div className="flex gap-x-2 items-center">
                <div className="w-6 h-6 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="w-4 h-4 bg-gray-200 rounded-md animate-pulse"></div>
              </div>
            </div>

            <div className="h-8 bg-gray-200 rounded-md w-1/2 animate-pulse mb-4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded-md w-full animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded-md w-full animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded-md w-3/4 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded-md w-full animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded-md w-5/6 animate-pulse"></div>
            </div>
          </div>

          {/* Right Column Skeleton */}
          <div className="lg:col-span-1">
            <div className="bg-white w-full mb-8 border border-gray-300 rounded-lg px-4 sm:px-6 py-6 sm:py-8">
              <div className="flex items-center gap-x-4 mb-6">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 rounded-full animate-pulse"></div>
                <div>
                  <div className="h-6 bg-gray-200 rounded-md w-40 animate-pulse mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded-md w-24 animate-pulse"></div>
                </div>
              </div>
              {/* Form Skeleton */}
              <div className="flex flex-col gap-y-4">
                <div className="h-12 bg-gray-200 rounded-md w-full animate-pulse"></div>
                <div className="h-12 bg-gray-200 rounded-md w-full animate-pulse"></div>
                <div className="h-12 bg-gray-200 rounded-md w-full animate-pulse"></div>
                <div className="h-36 bg-gray-200 rounded-md w-full animate-pulse"></div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="h-12 bg-gray-200 rounded-md w-full animate-pulse"></div>
                  <div className="h-12 bg-gray-200 rounded-md w-full animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Amenities Skeleton */}
        <div className="mt-10">
          <div className="h-8 bg-gray-200 rounded-md w-64 animate-pulse mb-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[...Array(4)].map((_, index) => (
              <div
                key={`amenity-1-${index}`}
                className="border rounded-md p-4 flex flex-col items-center justify-center"
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded-md w-24 animate-pulse mt-2"></div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
            {[...Array(4)].map((_, index) => (
              <div
                key={`amenity-2-${index}`}
                className="border rounded-md p-4 flex flex-col items-center justify-center"
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded-md w-24 animate-pulse mt-2"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Property Services Skeleton */}
        <div className="mt-8">
          <div className="h-6 bg-gray-200 rounded-md w-48 animate-pulse mb-3"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {[...Array(9)].map((_, index) => (
              <div key={`service-${index}`} className="flex items-center">
                <span className="mr-2">&bull;</span>
                <div className="h-4 bg-gray-200 rounded-md w-32 animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>

        <hr className="h-px w-full my-8 bg-gray-200 border-0" />

        {/* Additional sections skeleton - simplified for brevity */}
        {[...Array(3)].map((_, sectionIndex) => (
          <div key={`section-${sectionIndex}`}>
            <div className="h-6 bg-gray-200 rounded-md w-48 animate-pulse mb-3"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {[...Array(5)].map((_, itemIndex) => (
                <div
                  key={`item-${sectionIndex}-${itemIndex}`}
                  className="flex items-center"
                >
                  <span className="mr-2">&bull;</span>
                  <div className="h-4 bg-gray-200 rounded-md w-32 animate-pulse"></div>
                </div>
              ))}
            </div>
            <hr className="h-px w-full my-8 bg-gray-200 border-0" />
          </div>
        ))}
      </div>
    </section>
  );
};

export default Skeleton;
