import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
// import { fetchStores, setCurrentPage } from "../storesSlice";
import StoreCard from "../components/StoreCard";
import { fetchStoresWithReviews ,setCurrentPage } from "../../review/reviewSlice";

const StoresPage = () => {
  const dispatch = useDispatch();
  const { allStores, loading, error, currentPage, itemsPerPage } = useSelector(state => state.reviews);

  useEffect(() => {
    dispatch(fetchStoresWithReviews());
    // console.log("allStores",allStores);
  }, [dispatch]);


  const indexOfLastStore = currentPage * itemsPerPage;
  const indexOfFirstStore = indexOfLastStore - itemsPerPage;
  const currentStores = allStores.slice(indexOfFirstStore, indexOfLastStore);

  const totalPages = Math.ceil(allStores.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    dispatch(setCurrentPage(pageNumber));
  };


  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (error) return <p className="text-center mt-10 text-red-500">{error}</p>;

  return (
    <>
    <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {currentStores.map(store => <StoreCard key={store.id} store={store} />)}

    </div>

    {/*  Pagination  */}
      <div className="flex justify-center mt-6 space-x-2">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
          <button
            key={page}
            onClick={() => handlePageChange(page)}
            className={`px-3 py-1 rounded ${currentPage === page ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            {page}
          </button>
        ))}
      </div>
    </>
  );
};

export default StoresPage;
