import React, { useContext } from "react";

import CountryDropdown from "./CountryDropdown";
import PropertyDropdown from "./PropertyDropdown";
import PriceRangeDropdown from "./PriceRangeDropdown";

import { RiSearch2Line } from "react-icons/ri";

import { HouseContext } from "../contexts/HouseContext";
import BedsDropdown from "./BedDropdown";
import BathsDropdown from "./BathDropdown";

const Search = () => {
  const { handleClick } = useContext(HouseContext);

  return (
    <div className="px-[30px] py-6 max-w-[1320px] mx-auto flex flex-col lg:flex-row justify-between gap-4 lg:gap-x-3 relative lg:-top-4 lg:shadow-1 bg-white lg:bg-white/50 lg:backdrop-blur rounded-lg">
      <CountryDropdown />
      <PropertyDropdown />
      <PriceRangeDropdown />
      <BedsDropdown />
      <BathsDropdown />
      <button
        onClick={() => handleClick()}
        className="bg-violet-700 hover:bg-violet-800 transition w-full lg:max-w-[162px] h-16 rounded-lg flex justify-center items-center text-white text-lg"
      >
        <RiSearch2Line />
      </button>
    </div>
  );
};

export default Search;
